"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Bold, Italic, Link as LinkIcon, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

// A real WYSIWYG editor (TipTap — a small, headless, actively-maintained
// alternative to CKEditor that's easy to skin with our own Tailwind
// classes instead of shipping its own UI). Formatting shows up as you type
// instead of raw markdown syntax; the stored value is the resulting HTML.
export function RichTextEditor({ value, onValueChange, placeholder, id }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline underline-offset-2" },
      }),
      Placeholder.configure({ placeholder: placeholder ?? "Write something..." }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onValueChange(editor.getHTML()),
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        class:
          "min-h-32 px-3 py-2 text-sm outline-none [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold",
      },
    },
  });

  if (!editor) {
    return <div className="min-h-40 animate-pulse rounded-lg border border-input bg-secondary/30" />;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const toolbarButtons: { icon: typeof Bold; label: string; onClick: () => void; active: boolean }[] = [
    {
      icon: Bold,
      label: "Bold",
      onClick: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      icon: Italic,
      label: "Italic",
      onClick: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      icon: List,
      label: "Bullet list",
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      label: "Numbered list",
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    { icon: LinkIcon, label: "Link", onClick: setLink, active: editor.isActive("link") },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-input dark:bg-input/30">
      <div className="flex items-center gap-0.5 border-b border-input bg-secondary/40 p-1">
        {toolbarButtons.map(({ icon: Icon, label, onClick, active }) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            size="icon-xs"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            aria-label={label}
            aria-pressed={active}
            className={cn(active && "bg-secondary text-foreground")}
          >
            <Icon />
          </Button>
        ))}
      </div>
      <EditorContent editor={editor as Editor} />
    </div>
  );
}
