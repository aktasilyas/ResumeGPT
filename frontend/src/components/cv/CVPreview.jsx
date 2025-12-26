import { useMemo } from "react";

const TEMPLATE_STYLES = {
  minimal: {
    wrapper: "bg-white",
    header: "bg-white border-b-2 border-emerald-700",
    headerText: "text-slate-900",
    headerSubtext: "text-slate-500",
    content: "bg-white",
    sectionTitle: "text-emerald-700 border-b border-slate-200 pb-2",
    bodyText: "text-slate-600",
    itemTitle: "text-slate-800",
    skillBg: "bg-slate-100 text-slate-700",
  },
  corporate: {
    wrapper: "bg-white",
    header: "bg-slate-800",
    headerText: "text-white",
    headerSubtext: "text-slate-300",
    content: "bg-white",
    sectionTitle: "text-slate-800 border-b-2 border-slate-800 pb-2",
    bodyText: "text-slate-600",
    itemTitle: "text-slate-800",
    skillBg: "bg-slate-800 text-white",
  },
  creative: {
    wrapper: "bg-gradient-to-br from-white to-emerald-50",
    header: "bg-gradient-to-r from-emerald-700 to-teal-600",
    headerText: "text-white",
    headerSubtext: "text-emerald-100",
    content: "bg-transparent",
    sectionTitle: "text-emerald-700 border-l-4 border-emerald-500 pl-4",
    bodyText: "text-slate-600",
    itemTitle: "text-slate-800",
    skillBg: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
  },
  tech: {
    wrapper: "bg-slate-900",
    header: "bg-slate-950 border-b border-lime-500/30",
    headerText: "text-lime-400",
    headerSubtext: "text-slate-400",
    content: "bg-slate-900",
    sectionTitle: "text-lime-400 font-mono uppercase tracking-wider text-sm border-b border-slate-700 pb-2",
    bodyText: "text-slate-300",
    itemTitle: "text-white",
    skillBg: "bg-lime-500/20 text-lime-400 border border-lime-500/50",
  },
};

export default function CVPreview({ cv, scale = 0.5 }) {
  const data = cv?.data || {};
  const settings = cv?.settings || {};
  const personal = data.personal_info || {};
  const templateId = settings.template || "minimal";
  const template = TEMPLATE_STYLES[templateId] || TEMPLATE_STYLES.minimal;

  const containerStyle = useMemo(() => ({
    width: `${210 * scale}mm`,
    height: `${297 * scale}mm`,
    overflow: "hidden",
  }), [scale]);

  const previewStyle = useMemo(() => ({
    transform: `scale(${scale})`,
    transformOrigin: "top left",
    width: "210mm",
    minHeight: "297mm",
  }), [scale]);

  return (
    <div className="cv-preview-container rounded-lg overflow-hidden" style={containerStyle}>
      <div
        className={`shadow-2xl ring-1 ring-black/5 ${template.wrapper}`}
        style={previewStyle}
        data-testid="cv-preview"
      >
        {/* Header */}
        <div className={`px-10 py-8 ${template.header}`}>
          <h1 className={`text-3xl font-bold mb-2 ${template.headerText}`}>
            {personal.full_name || "Your Name"}
          </h1>
          <div className={`flex flex-wrap gap-x-4 gap-y-1 text-sm ${template.headerSubtext}`}>
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>• {personal.phone}</span>}
            {personal.location && <span>• {personal.location}</span>}
          </div>
          {(personal.linkedin || personal.website) && (
            <div className={`flex flex-wrap gap-4 mt-2 text-sm ${template.headerSubtext}`}>
              {personal.linkedin && <span>{personal.linkedin}</span>}
              {personal.website && <span>{personal.website}</span>}
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`px-10 py-6 ${template.content}`}>
          {/* Summary */}
          {settings.visible_sections?.summary !== false && data.summary && (
            <section className="mb-6">
              <h2 className={`text-lg font-semibold mb-3 ${template.sectionTitle}`}>
                Professional Summary
              </h2>
              <p className={`text-sm leading-relaxed ${template.bodyText}`}>
                {data.summary}
              </p>
            </section>
          )}

          {/* Experience */}
          {settings.visible_sections?.experience !== false && data.experiences?.length > 0 && (
            <section className="mb-6">
              <h2 className={`text-lg font-semibold mb-3 ${template.sectionTitle}`}>
                Work Experience
              </h2>
              <div className="space-y-4">
                {data.experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className={`font-semibold ${template.itemTitle}`}>
                          {exp.position || "Position"}
                        </h3>
                        <p className={`text-sm ${template.bodyText}`}>
                          {exp.company || "Company"}
                        </p>
                      </div>
                      <span className={`text-sm whitespace-nowrap ${template.bodyText}`}>
                        {exp.start_date || "Start"} - {exp.current ? "Present" : (exp.end_date || "End")}
                      </span>
                    </div>
                    {exp.description && (
                      <p className={`text-sm mt-2 whitespace-pre-line ${template.bodyText}`}>
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {settings.visible_sections?.education !== false && data.education?.length > 0 && (
            <section className="mb-6">
              <h2 className={`text-lg font-semibold mb-3 ${template.sectionTitle}`}>
                Education
              </h2>
              <div className="space-y-3">
                {data.education.map((edu) => (
                  <div key={edu.id} className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-semibold ${template.itemTitle}`}>
                        {edu.degree || "Degree"} {edu.field && `in ${edu.field}`}
                      </h3>
                      <p className={`text-sm ${template.bodyText}`}>
                        {edu.institution || "Institution"}
                      </p>
                    </div>
                    <span className={`text-sm whitespace-nowrap ${template.bodyText}`}>
                      {edu.start_date || "Start"} - {edu.end_date || "End"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {settings.visible_sections?.skills !== false && data.skills?.length > 0 && (
            <section className="mb-6">
              <h2 className={`text-lg font-semibold mb-3 ${template.sectionTitle}`}>
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${template.skillBg}`}
                  >
                    {skill.name || "Skill"}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {settings.visible_sections?.languages !== false && data.languages?.length > 0 && (
            <section className="mb-6">
              <h2 className={`text-lg font-semibold mb-3 ${template.sectionTitle}`}>
                Languages
              </h2>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {data.languages.map((lang) => (
                  <div key={lang.id} className={`text-sm ${template.bodyText}`}>
                    <span className={`font-medium ${template.itemTitle}`}>
                      {lang.name || "Language"}
                    </span>
                    <span className="opacity-70 ml-1">({lang.proficiency || "Level"})</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certificates */}
          {settings.visible_sections?.certificates !== false && data.certificates?.length > 0 && (
            <section className="mb-6">
              <h2 className={`text-lg font-semibold mb-3 ${template.sectionTitle}`}>
                Certifications
              </h2>
              <div className="space-y-2">
                {data.certificates.map((cert) => (
                  <div key={cert.id} className="flex justify-between items-start">
                    <div>
                      <span className={`font-medium ${template.itemTitle}`}>
                        {cert.name || "Certificate"}
                      </span>
                      {cert.issuer && (
                        <span className={`ml-2 ${template.bodyText}`}>- {cert.issuer}</span>
                      )}
                    </div>
                    {cert.date && (
                      <span className={`text-sm ${template.bodyText}`}>{cert.date}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {settings.visible_sections?.projects !== false && data.projects?.length > 0 && (
            <section>
              <h2 className={`text-lg font-semibold mb-3 ${template.sectionTitle}`}>
                Projects
              </h2>
              <div className="space-y-3">
                {data.projects.map((project) => (
                  <div key={project.id}>
                    <h3 className={`font-medium ${template.itemTitle}`}>
                      {project.name || "Project"}
                    </h3>
                    {project.description && (
                      <p className={`text-sm mt-1 ${template.bodyText}`}>
                        {project.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
