type SectionHeadProps = {
  children: string;
};

export function SectionHead({ children }: SectionHeadProps) {
  return <div className="s-head">{children}</div>;
}
