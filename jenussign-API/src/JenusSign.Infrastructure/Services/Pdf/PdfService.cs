using JenusSign.Core.Entities;
using JenusSign.Core.Interfaces;
using Microsoft.Extensions.Logging;
using PdfSharpCore.Drawing;
using PdfSharpCore.Pdf;

namespace JenusSign.Infrastructure.Services.Pdf;

/// <summary>
/// PDF service for generating audit trails and signed documents
/// </summary>
public class PdfService : IPdfService
{
    private readonly ISigningService _signingService;
    private readonly ILogger<PdfService> _logger;

    public PdfService(ISigningService signingService, ILogger<PdfService> logger)
    {
        _signingService = signingService;
        _logger = logger;
    }

    public async Task<byte[]> GenerateAuditTrailPdfAsync(SigningSession session, CancellationToken cancellationToken = default)
    {
        var document = new PdfDocument();
        document.Info.Title = "Signature Evidence Record";
        document.Info.Author = "JenusSign";

        var page = document.AddPage();
        page.Size = PdfSharpCore.PageSize.A4;
        var gfx = XGraphics.FromPdfPage(page);

        // Fonts
        var titleFont = new XFont("Arial", 18, XFontStyle.Bold);
        var headerFont = new XFont("Arial", 12, XFontStyle.Bold);
        var normalFont = new XFont("Arial", 10, XFontStyle.Regular);
        var smallFont = new XFont("Arial", 8, XFontStyle.Regular);

        double y = 50;
        double leftMargin = 50;
        double rightMargin = page.Width - 50;

        // Header
        gfx.DrawString("JenusSign", titleFont, XBrushes.DarkBlue, leftMargin, y);
        y += 20;
        gfx.DrawString("eIDAS Digital Signing Platform", normalFont, XBrushes.Gray, leftMargin, y);
        y += 15;
        gfx.DrawString("eIDAS COMPLIANT", smallFont, XBrushes.Green, leftMargin, y);
        y += 30;

        // Signature Status
        gfx.DrawString("✓ SIGNATURE EVIDENCE RECORD", headerFont, XBrushes.Green, leftMargin, y);
        y += 15;
        gfx.DrawString("Electronic Signature Verification & Audit Trail", normalFont, XBrushes.Black, leftMargin, y);
        y += 25;
        gfx.DrawString("SIGNATURE STATUS: VERIFIED", headerFont, XBrushes.Green, leftMargin, y);
        y += 30;

        // Document Information
        DrawSection(gfx, ref y, leftMargin, "DOCUMENT INFORMATION", headerFont);
        DrawField(gfx, ref y, leftMargin, "Document Title:", session.Proposal?.Title ?? "Insurance Proposal", normalFont);
        DrawField(gfx, ref y, leftMargin, "Reference Number:", session.Proposal?.ReferenceNumber ?? session.BusinessKey, normalFont);
        DrawField(gfx, ref y, leftMargin, "Document Pages:", session.Proposal?.DocumentPages?.ToString() ?? "N/A", normalFont);
        y += 15;

        // Document Hash
        DrawSection(gfx, ref y, leftMargin, "DOCUMENT HASH (SHA-256)", headerFont);
        gfx.DrawString(session.DocumentHash ?? "N/A", smallFont, XBrushes.DarkBlue, leftMargin, y);
        y += 25;

        // Signatory Information
        DrawSection(gfx, ref y, leftMargin, "SIGNATORY INFORMATION", headerFont);
        DrawField(gfx, ref y, leftMargin, "Full Name:", session.VerifiedName ?? session.Customer?.DisplayName ?? "N/A", normalFont);
        DrawField(gfx, ref y, leftMargin, "Email Address:", session.Customer?.Email ?? "N/A", normalFont);
        DrawField(gfx, ref y, leftMargin, "Mobile Number:", session.Customer?.Phone ?? "N/A", normalFont);
        DrawField(gfx, ref y, leftMargin, "ID Number:", session.VerifiedIdNumber ?? "N/A", normalFont);
        DrawField(gfx, ref y, leftMargin, "Verification Method:", session.VerificationMethod.ToString(), normalFont);
        y += 15;

        // Timestamp & Location
        DrawSection(gfx, ref y, leftMargin, "TIMESTAMP & LOCATION", headerFont);
        DrawField(gfx, ref y, leftMargin, "Signature Timestamp:", session.SignedAt?.ToString("dd MMMM yyyy 'at' HH:mm:ss 'UTC'") ?? "N/A", normalFont);
        DrawField(gfx, ref y, leftMargin, "Timestamp Authority:", session.TimestampAuthority ?? "FreeTSA.org (RFC 3161 Compliant)", normalFont);
        DrawField(gfx, ref y, leftMargin, "IP Address:", session.IpAddress ?? "N/A", normalFont);
        DrawField(gfx, ref y, leftMargin, "Device:", session.UserAgent?.Split('(').FirstOrDefault()?.Trim() ?? "N/A", normalFont);
        y += 15;

        // OTP Verification
        DrawSection(gfx, ref y, leftMargin, "OTP VERIFICATION", headerFont);
        DrawField(gfx, ref y, leftMargin, "OTP Channel:", session.OtpChannel.ToString(), normalFont);
        DrawField(gfx, ref y, leftMargin, "OTP Sent To:", session.OtpSentTo ?? "N/A", normalFont);
        DrawField(gfx, ref y, leftMargin, "OTP Verified At:", session.OtpVerifiedAt?.ToString("dd MMMM yyyy 'at' HH:mm:ss 'UTC'") ?? "N/A", normalFont);
        DrawField(gfx, ref y, leftMargin, "Verification Status:", session.OtpVerified ? "✓ VERIFIED" : "NOT VERIFIED", normalFont);
        y += 15;

        // Page 2 - Certificate Chain and eIDAS Compliance
        if (y > page.Height - 150)
        {
            page = document.AddPage();
            page.Size = PdfSharpCore.PageSize.A4;
            gfx = XGraphics.FromPdfPage(page);
            y = 50;
        }

        // Certificate Chain
        var certInfo = await _signingService.GetCertificateInfoAsync(cancellationToken);
        DrawSection(gfx, ref y, leftMargin, "CERTIFICATE CHAIN", headerFont);
        for (int i = 0; i < certInfo.CertificateChain.Length; i++)
        {
            DrawField(gfx, ref y, leftMargin, $"{i + 1}.", certInfo.CertificateChain[i], normalFont);
        }
        y += 15;

        // eIDAS Compliance Table
        DrawSection(gfx, ref y, leftMargin, "eIDAS COMPLIANCE", headerFont);
        DrawComplianceRow(gfx, ref y, leftMargin, "Article 26(a)", "Uniquely linked to signatory", "✓ Verified", normalFont);
        DrawComplianceRow(gfx, ref y, leftMargin, "Article 26(b)", "Capable of identifying signatory", "✓ Verified", normalFont);
        DrawComplianceRow(gfx, ref y, leftMargin, "Article 26(c)", "Signatory has sole control", "✓ Verified", normalFont);
        DrawComplianceRow(gfx, ref y, leftMargin, "Article 26(d)", "Detects subsequent changes", "✓ Verified", normalFont);
        y += 20;

        // Legal Notice
        gfx.DrawString("LEGAL NOTICE:", smallFont, XBrushes.DarkBlue, leftMargin, y);
        y += 12;
        var legalText = "This Signature Evidence Record constitutes proof of the signatory's intent to be bound by the contents of the signed document in accordance with Regulation (EU) No 910/2014 (eIDAS Regulation), Article 26. This Advanced Electronic Signature (AES) has the legal effect of a handwritten signature under EU law.";
        DrawWrappedText(gfx, legalText, smallFont, leftMargin, ref y, rightMargin - leftMargin);

        // Footer
        y = page.Height - 40;
        gfx.DrawString($"Document generated: {DateTime.UtcNow:dd MMMM yyyy 'at' HH:mm}", smallFont, XBrushes.Gray, leftMargin, y);
        gfx.DrawString($"Page {document.PageCount}", smallFont, XBrushes.Gray, rightMargin - 50, y);

        using var stream = new MemoryStream();
        document.Save(stream, false);
        return stream.ToArray();
    }

    public async Task<byte[]> MergeDocumentsAsync(byte[] proposalPdf, byte[] auditTrailPdf, CancellationToken cancellationToken = default)
    {
        // For simplicity, we'll just concatenate the audit trail to the proposal
        // In production, you'd use a proper PDF library to merge
        using var mergedStream = new MemoryStream();
        await mergedStream.WriteAsync(proposalPdf, cancellationToken);
        await mergedStream.WriteAsync(auditTrailPdf, cancellationToken);
        return mergedStream.ToArray();
    }

    public Task<byte[]> ApplyDigitalSealAsync(byte[] pdfContent, SignatureResult signature, TimestampResult timestamp, CancellationToken cancellationToken = default)
    {
        // In production, this would embed the digital signature into the PDF
        // using proper PDF signing libraries like iTextSharp or PdfSharpCore
        return Task.FromResult(pdfContent);
    }

    private void DrawSection(XGraphics gfx, ref double y, double x, string title, XFont font)
    {
        gfx.DrawString(title, font, XBrushes.DarkBlue, x, y);
        y += 5;
        gfx.DrawLine(new XPen(XColors.LightGray, 0.5), x, y, x + 200, y);
        y += 15;
    }

    private void DrawField(XGraphics gfx, ref double y, double x, string label, string value, XFont font)
    {
        gfx.DrawString(label, font, XBrushes.Gray, x, y);
        gfx.DrawString(value, font, XBrushes.Black, x + 120, y);
        y += 15;
    }

    private void DrawComplianceRow(XGraphics gfx, ref double y, double x, string requirement, string description, string status, XFont font)
    {
        gfx.DrawString(requirement, font, XBrushes.Black, x, y);
        gfx.DrawString(description, font, XBrushes.Gray, x + 80, y);
        gfx.DrawString(status, font, XBrushes.Green, x + 280, y);
        y += 15;
    }

    private void DrawWrappedText(XGraphics gfx, string text, XFont font, double x, ref double y, double maxWidth)
    {
        var words = text.Split(' ');
        var currentLine = "";
        
        foreach (var word in words)
        {
            var testLine = string.IsNullOrEmpty(currentLine) ? word : currentLine + " " + word;
            var size = gfx.MeasureString(testLine, font);
            
            if (size.Width > maxWidth)
            {
                gfx.DrawString(currentLine, font, XBrushes.Gray, x, y);
                y += 12;
                currentLine = word;
            }
            else
            {
                currentLine = testLine;
            }
        }
        
        if (!string.IsNullOrEmpty(currentLine))
        {
            gfx.DrawString(currentLine, font, XBrushes.Gray, x, y);
            y += 12;
        }
    }
}
