import {
  afterNextRender,
  Component,
  ElementRef,
  OnDestroy,
  output,
  ViewChild,
} from '@angular/core';
import Editor from '@toast-ui/editor';
import { loadTuiEditor } from '../tui-editor.loader';

@Component({
  selector: 'app-md-editor',
  imports: [],
  template: `
    <div #editorElement></div>
    <div>
      <button
        type="button"
        (click)="getContent()"
        class="bg-blue-500 p-2 rounded-2xl cursor-pointer"
      >
        轉換成string
      </button>
    </div>
  `,
  styles: [],
})
export class MdEditor {
  @ViewChild('editorElement') editorElement!: ElementRef;
  editor?: Editor;
  editorContent = output<string>();

  constructor() {
    // 🚀 關鍵：afterNextRender 保證只在瀏覽器執行
    afterNextRender(async () => {
      // 動態載入套件，避免伺服器端編譯錯誤
      const { Editor, codeSyntaxHighlight, Prism } = await loadTuiEditor();

      this.editor = new Editor({
        el: this.editorElement.nativeElement,
        height: '80vh',
        initialEditType: 'markdown',
        previewStyle: 'vertical',
        initialValue: `# Hello Angular 21! \n ## 標題一 \n - item1 \n - item2 \n **粗體** *斜體* \n\`\`\`html\n<div id="editor"><span>baz</span></div>\n\`\`\`
        `,
        plugins: [[codeSyntaxHighlight, { highlighter: Prism }]],
        theme: 'dark', // 啟用深色主題
      });
    });
  }

  ngOnDestroy() {
    // 記得在組件銷毀時釋放資源，這是好習慣！
    if (this.editor) {
      this.editor.destroy();
    }
  }

  // 獲取內容的方法
  getContent() {
    if (this.editor) {
      const markdownContent = this.editor.getMarkdown();
      this.editorContent.emit(markdownContent);
    }
  }
}
