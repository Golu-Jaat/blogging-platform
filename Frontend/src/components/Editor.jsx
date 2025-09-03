import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

export default function Editor({ value = "", onChange, placeholder = "Write your story..." }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  return (
    <div className="border border-slate-700 rounded-md bg-slate-800 text-slate-100">
      <div className="flex flex-wrap gap-2 p-2 border-b border-slate-700">
        <button type="button" className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600" onClick={() => editor?.chain().focus().toggleBold().run()}>B</button>
        <button type="button" className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600" onClick={() => editor?.chain().focus().toggleItalic().run()}>I</button>
        <button type="button" className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600" onClick={() => editor?.chain().focus().toggleBulletList().run()}>• List</button>
        <button type="button" className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600" onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1. List</button>
        <button type="button" className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600" onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}>Clear</button>
      </div>
      <div className="p-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
