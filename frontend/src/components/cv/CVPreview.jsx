import { useMemo } from "react";

const TEMPLATES = {
  minimal: {
    headerBg: "bg-white",
    headerText: "text-slate-900",
    sectionTitle: "text-primary border-b border-slate-200",
    bodyText: "text-slate-600",
  },
  corporate: {
    headerBg: "bg-slate-800",
    headerText: "text-white",
    sectionTitle: "text-slate-800 border-b border-slate-300",
    bodyText: "text-slate-600",
  },
  creative: {
    headerBg: "bg-gradient-to-r from-primary to-emerald-600",
    headerText: "text-white",
    sectionTitle: "text-primary border-l-4 border-primary pl-3",
    bodyText: "text-slate-600",
  },
  tech: {
    headerBg: "bg-slate-900",
    headerText: "text-lime-300",
    sectionTitle: "text-lime-400 font-mono uppercase tracking-wider",
    bodyText: "text-slate-300",
  },
};

export default function CVPreview({ cv, scale = 0.5 }) {
  const data = cv?.data || {};
  const settings = cv?.settings || {};
  const personal = data.personal_info || {};
  const template = TEMPLATES[settings.template] || TEMPLATES.minimal;

  const styles = useMemo(() => ({
    transform: `scale(${scale})`,
    transformOrigin: "top left",
    width: "210mm",
    minHeight: "297mm",
  }), [scale]);

  return (
    <div className="cv-preview-container" style={{ width: `${210 * scale}mm`, height: `${297 * scale}mm`, overflow: "hidden" }}>
      <div
        className={`bg-white shadow-xl ${settings.template === "tech" ? "bg-slate-900" : ""}`}
        style={styles}
        data-testid="cv-preview"
      >
        {/* Header */}
        <div className={`${template.headerBg} px-10 py-8`}>
          <h1 className={`text-3xl font-bold ${template.headerText}`}>
            {personal.full_name || "Your Name"}
          </h1>
          <div className={`flex flex-wrap gap-4 mt-3 text-sm ${settings.template === "corporate" || settings.template === "tech" ? "text-slate-300" : "text-slate-500"}`}>
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>• {personal.phone}</span>}
            {personal.location && <span>• {personal.location}</span>}
          </div>
          {(personal.linkedin || personal.website) && (
            <div className={`flex gap-4 mt-2 text-sm ${settings.template === "corporate" || settings.template === "tech" ? "text-slate-400" : "text-slate-400"}`}>
              {personal.linkedin && <span>{personal.linkedin}</span>}
              {personal.website && <span>{personal.website}</span>}
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`px-10 py-6 ${settings.template === "tech" ? "bg-slate-900" : ""}`}>
          {/* Summary */}
          {settings.visible_sections?.summary !== false && data.summary && (
            <section className="mb-6">
              <h2 className={`text-lg font-semibold pb-2 mb-3 ${template.sectionTitle}`}>
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
              <h2 className={`text-lg font-semibold pb-2 mb-3 ${template.sectionTitle}`}>
                Work Experience
              </h2>
              <div className="space-y-4">
                {data.experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-semibold ${settings.template === "tech" ? "text-white" : "text-slate-800"}`}>
                          {exp.position}
                        </h3>
                        <p className={`text-sm ${template.bodyText}`}>{exp.company}</p>
                      </div>
                      <span className={`text-sm ${template.bodyText}`}>
                        {exp.start_date} - {exp.current ? "Present" : exp.end_date}
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
              <h2 className={`text-lg font-semibold pb-2 mb-3 ${template.sectionTitle}`}>
                Education
              </h2>
              <div className="space-y-3">
                {data.education.map((edu) => (
                  <div key={edu.id} className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-semibold ${settings.template === "tech" ? "text-white" : "text-slate-800"}`}>
                        {edu.degree} in {edu.field}
                      </h3>
                      <p className={`text-sm ${template.bodyText}`}>{edu.institution}</p>
                    </div>
                    <span className={`text-sm ${template.bodyText}`}>
                      {edu.start_date} - {edu.end_date}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {settings.visible_sections?.skills !== false && data.skills?.length > 0 && (
            <section className="mb-6">
              <h2 className={`text-lg font-semibold pb-2 mb-3 ${template.sectionTitle}`}>
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className={`px-3 py-1 rounded-full text-sm ${
                      settings.template === "tech"
                        ? "bg-lime-900/50 text-lime-300 border border-lime-600"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {settings.visible_sections?.languages !== false && data.languages?.length > 0 && (
            <section className="mb-6">
              <h2 className={`text-lg font-semibold pb-2 mb-3 ${template.sectionTitle}`}>
                Languages
              </h2>
              <div className="flex flex-wrap gap-4">
                {data.languages.map((lang) => (
                  <div key={lang.id} className={`text-sm ${template.bodyText}`}>
                    <span className={`font-medium ${settings.template === "tech" ? "text-white" : "text-slate-800"}`}>
                      {lang.name}
                    </span>
                    <span className="text-slate-400 ml-1">({lang.proficiency})</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certificates */}
          {settings.visible_sections?.certificates !== false && data.certificates?.length > 0 && (
            <section className="mb-6">
              <h2 className={`text-lg font-semibold pb-2 mb-3 ${template.sectionTitle}`}>
                Certifications
              </h2>
              <div className="space-y-2">
                {data.certificates.map((cert) => (
                  <div key={cert.id} className="flex justify-between items-start">
                    <div>
                      <span className={`font-medium ${settings.template === "tech" ? "text-white" : "text-slate-800"}`}>
                        {cert.name}
                      </span>
                      <span className={`ml-2 ${template.bodyText}`}>- {cert.issuer}</span>
                    </div>
                    <span className={`text-sm ${template.bodyText}`}>{cert.date}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {settings.visible_sections?.projects !== false && data.projects?.length > 0 && (
            <section>
              <h2 className={`text-lg font-semibold pb-2 mb-3 ${template.sectionTitle}`}>
                Projects
              </h2>
              <div className="space-y-3">
                {data.projects.map((project) => (
                  <div key={project.id}>
                    <h3 className={`font-medium ${settings.template === "tech" ? "text-white" : "text-slate-800"}`}>
                      {project.name}
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
