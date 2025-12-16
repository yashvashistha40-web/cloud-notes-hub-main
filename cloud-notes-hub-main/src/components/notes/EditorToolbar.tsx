import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  List, 
  ListOrdered,
  Highlighter,
  Type,
  Palette,
  Paperclip
} from 'lucide-react';
import { useRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface EditorToolbarProps {
  onFileAttach: (files: FileList) => void;
}

const fontFamilies = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
];

const fontSizes = [
  { value: '1', label: '10px' },
  { value: '2', label: '13px' },
  { value: '3', label: '16px' },
  { value: '4', label: '18px' },
  { value: '5', label: '24px' },
  { value: '6', label: '32px' },
  { value: '7', label: '48px' },
];

const textColors = [
  '#000000', '#374151', '#DC2626', '#EA580C', '#CA8A04', 
  '#16A34A', '#0891B2', '#2563EB', '#7C3AED', '#DB2777'
];

const highlightColors = [
  '#FEF08A', '#BBF7D0', '#BAE6FD', '#DDD6FE', '#FBCFE8',
  '#FED7AA', '#FECACA', '#E5E7EB', '#FFFFFF', 'transparent'
];

export default function EditorToolbar({ onFileAttach }: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileAttach(e.target.files);
      e.target.value = '';
    }
  };

  const ToolbarButton = ({ 
    onClick, 
    children, 
    title 
  }: { 
    onClick: () => void; 
    children: React.ReactNode; 
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-2 rounded hover:bg-muted transition-colors text-foreground/70 hover:text-foreground"
    >
      {children}
    </button>
  );

  return (
    <div className="flex items-center gap-1 p-2 border-b border-border flex-wrap">
      {/* Font Family */}
      <Select onValueChange={(value) => execCommand('fontName', value)}>
        <SelectTrigger className="w-32 h-8 text-xs">
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          {fontFamilies.map((font) => (
            <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Font Size */}
      <Select onValueChange={(value) => execCommand('fontSize', value)}>
        <SelectTrigger className="w-20 h-8 text-xs">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {fontSizes.map((size) => (
            <SelectItem key={size.value} value={size.value}>
              {size.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Text Formatting */}
      <ToolbarButton onClick={() => execCommand('bold')} title="Bold">
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => execCommand('italic')} title="Italic">
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => execCommand('underline')} title="Underline">
        <Underline className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => execCommand('strikeThrough')} title="Strikethrough">
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Text Color */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            title="Text Color"
            className="p-2 rounded hover:bg-muted transition-colors text-foreground/70 hover:text-foreground"
          >
            <Palette className="w-4 h-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="grid grid-cols-5 gap-1">
            {textColors.map((color) => (
              <button
                key={color}
                onClick={() => execCommand('foreColor', color)}
                className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Highlight Color */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            title="Highlight"
            className="p-2 rounded hover:bg-muted transition-colors text-foreground/70 hover:text-foreground"
          >
            <Highlighter className="w-4 h-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="grid grid-cols-5 gap-1">
            {highlightColors.map((color, i) => (
              <button
                key={i}
                onClick={() => execCommand('hiliteColor', color)}
                className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: color === 'transparent' ? '#fff' : color }}
                title={color === 'transparent' ? 'Remove highlight' : color}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Alignment */}
      <ToolbarButton onClick={() => execCommand('justifyLeft')} title="Align Left">
        <AlignLeft className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => execCommand('justifyCenter')} title="Align Center">
        <AlignCenter className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => execCommand('justifyRight')} title="Align Right">
        <AlignRight className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => execCommand('justifyFull')} title="Justify">
        <AlignJustify className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Lists */}
      <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
        <List className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Numbered List">
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-border mx-1" />

      {/* File Attachment */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleFileClick}
        className="h-8 gap-1 text-xs"
      >
        <Paperclip className="w-4 h-4" />
        Attach File
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
