type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export const SectionHeading = ({
  eyebrow,
  title,
  description
}: SectionHeadingProps) => (
  <div className="section-heading">
    <span className="section-heading__eyebrow">{eyebrow}</span>
    <h2>{title}</h2>
    <p>{description}</p>
  </div>
);
