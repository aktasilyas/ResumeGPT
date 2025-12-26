"""PDF generation utilities with XSS protection."""
from io import BytesIO, StringIO
from xhtml2pdf import pisa
from app.core.security import sanitize_html
from app.models.cv import CV
from app.models.user import User
from app.core.logging import logger


def generate_cv_pdf(cv: CV, user: User) -> bytes:
    """Generate PDF from CV with HTML sanitization using xhtml2pdf."""
    data = cv.data
    settings = cv.settings
    personal = data.personal_info

    # Sanitize all user inputs to prevent XSS
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{
                font-family: Arial, Helvetica, sans-serif;
                font-size: 11pt;
                line-height: 1.5;
                color: #1e293b;
                padding: 40px;
            }}
            .header {{
                text-align: center;
                margin-bottom: 24px;
                border-bottom: 2px solid {sanitize_html(settings.primary_color)};
                padding-bottom: 16px;
            }}
            .name {{
                font-size: 24pt;
                font-weight: 700;
                color: {sanitize_html(settings.primary_color)};
                margin-bottom: 8px;
            }}
            .contact {{ font-size: 10pt; color: #64748b; }}
            .contact span {{ margin: 0 8px; }}
            .section {{ margin-bottom: 20px; page-break-inside: avoid; }}
            .section-title {{
                font-size: 14pt;
                font-weight: 600;
                color: {sanitize_html(settings.primary_color)};
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 4px;
                margin-bottom: 12px;
            }}
            .summary {{ color: #475569; }}
            .exp-item, .edu-item {{ margin-bottom: 16px; page-break-inside: avoid; }}
            .exp-title {{ font-weight: 600; }}
            .exp-company {{ color: #64748b; }}
            .exp-date {{ color: #94a3b8; font-size: 10pt; }}
            .exp-desc {{ color: #475569; font-size: 10pt; white-space: pre-wrap; }}
            .skills-list {{ margin-top: 8px; }}
            .skill-tag {{
                background: #f1f5f9;
                padding: 4px 12px;
                border-radius: 16px;
                font-size: 10pt;
                display: inline-block;
                margin: 4px;
            }}
            .watermark {{
                position: fixed;
                bottom: 20px;
                right: 20px;
                opacity: 0.3;
                font-size: 10pt;
                color: #94a3b8;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <div class="name">{sanitize_html(personal.full_name or 'Your Name')}</div>
            <div class="contact">
                <span>{sanitize_html(personal.email)}</span>
                <span>{sanitize_html(personal.phone)}</span>
                <span>{sanitize_html(personal.location)}</span>
            </div>
        </div>
    """

    # Summary section
    if data.summary:
        html_content += f"""
        <div class="section">
            <div class="section-title">Professional Summary</div>
            <div class="summary">{sanitize_html(data.summary)}</div>
        </div>
        """

    # Experience section
    if data.experiences:
        html_content += '<div class="section"><div class="section-title">Work Experience</div>'
        for exp in data.experiences:
            end_date = "Present" if exp.current else sanitize_html(exp.end_date)
            html_content += f"""
            <div class="exp-item">
                <div>
                    <span class="exp-title">{sanitize_html(exp.position)}</span>
                    <span class="exp-company"> at {sanitize_html(exp.company)}</span>
                </div>
                <div class="exp-date">{sanitize_html(exp.start_date)} - {end_date}</div>
                <div class="exp-desc">{sanitize_html(exp.description)}</div>
            </div>
            """
        html_content += '</div>'

    # Education section
    if data.education:
        html_content += '<div class="section"><div class="section-title">Education</div>'
        for edu in data.education:
            html_content += f"""
            <div class="edu-item">
                <div>
                    <span class="exp-title">{sanitize_html(edu.degree)} in {sanitize_html(edu.field)}</span>
                    <span class="exp-company"> - {sanitize_html(edu.institution)}</span>
                </div>
                <div class="exp-date">{sanitize_html(edu.start_date)} - {sanitize_html(edu.end_date)}</div>
            </div>
            """
        html_content += '</div>'

    # Skills section
    if data.skills:
        html_content += '<div class="section"><div class="section-title">Skills</div><div class="skills-list">'
        for skill in data.skills:
            html_content += f'<span class="skill-tag">{sanitize_html(skill.name)}</span>'
        html_content += '</div></div>'

    # Add watermark for non-pro users
    if not user.is_pro:
        html_content += '<div class="watermark">Created with Smart Resume Builder</div>'

    html_content += '</body></html>'

    # Generate PDF using xhtml2pdf with UTF-8 encoding
    try:
        logger.info(f"Starting PDF generation for user {user.user_id}")

        # Use StringIO for HTML source (supports UTF-8) and BytesIO for PDF output
        source = StringIO(html_content)
        buffer = BytesIO()

        # Create PDF - xhtml2pdf will handle UTF-8 properly from StringIO
        pisa_status = pisa.CreatePDF(
            src=source,
            dest=buffer,
            encoding='utf-8'
        )

        source.close()

        if pisa_status.err:
            logger.error(f"PDF generation failed with error code: {pisa_status.err}", extra={"user_id": user.user_id})
            raise Exception(f"PDF generation failed with error code: {pisa_status.err}")

        pdf_bytes = buffer.getvalue()
        buffer.close()

        logger.info(f"PDF generation successful, size: {len(pdf_bytes)} bytes", extra={"user_id": user.user_id})
        return pdf_bytes

    except Exception as e:
        logger.error(f"PDF generation exception: {str(e)}", extra={"user_id": user.user_id, "error_type": type(e).__name__})
        raise
