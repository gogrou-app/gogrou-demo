"use client";

const baseInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.25)",
  color: "white",
  outline: "none",
  fontSize: 14,
};

const compactInputStyle = {
  ...baseInputStyle,
  borderRadius: 10,
};

export default function TextInput({
  value,
  onChange,
  placeholder = "",
  style,
  compact = false,
  type = "text",
  ...props
}) {
  const componentStyle = compact ? compactInputStyle : baseInputStyle;

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ ...componentStyle, ...style }}
      {...props}
    />
  );
}
