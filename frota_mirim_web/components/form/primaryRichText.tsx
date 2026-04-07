"use client";
import {
  Bold,
  Italic,
//   List,
//   ListOrdered,
//   Heading2,
  Eraser,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export const Button = ({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 rounded-lg transition ${
      active ? "bg-accent/10 text-accent" : "text-muted hover:bg-alternative-bg"
    }`}
  >
    {children}
  </button>
);

export default function PrimaryRichText({
  label,
  value,
  onChange,
  placeholder,
  error,
}: Props) {
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || "Digite aqui...",
      }),
    ],
    content: value || "<p></p>",
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "<p></p>");
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-bold uppercase tracking-widest text-muted/80">
        {label}
      </label>

      <div
        className={`
          rounded-xl border transition-all max-h-100 text-sm overflow-auto
          ${isFocused ? "border-accent ring-4 ring-accent/5" : "border-border"}
          ${error ? "border-error/50 bg-error/5" : ""}
        `}
      >
        {/* TOOLBAR */}
        <div className="flex items-center gap-1 px-2 py-1 border-b border-border bg-alternative-bg rounded-t-xl">
          <Button
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold size={16} />
          </Button>

          <Button
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic size={16} />
          </Button>

          {/* <Button
            active={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 size={16} />
          </Button>

          <Button
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List size={16} />
          </Button>

          <Button
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered size={16} />
          </Button> */}

          <Button
            onClick={() =>
              editor.chain().focus().clearNodes().unsetAllMarks().run()
            }
          >
            <Eraser size={16} />
          </Button>
        </div>

        {/* EDITOR */}
        <div
          className="p-3 min-h-25"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {error && (
        <span className="text-[10px] font-bold text-error">{error}</span>
      )}
    </div>
  );
}
