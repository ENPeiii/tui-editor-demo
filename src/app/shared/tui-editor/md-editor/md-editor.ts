import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  output,
  ViewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Editor from '@toast-ui/editor';
import { loadTuiEditor } from '../tui-editor.loader';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'md-editor',
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

  private http = inject(HttpClient);

  constructor() {
    // 🚀 關鍵：afterNextRender 保證只在瀏覽器執行
    afterNextRender(async () => {
      // 動態載入套件，避免伺服器端編譯錯誤
      const { Editor, codeSyntaxHighlight, tableMergedCell, Prism } = await loadTuiEditor();

      this.editor = new Editor({
        el: this.editorElement.nativeElement,
        height: '80vh',
        initialEditType: 'markdown',
        previewStyle: 'vertical',
        initialValue: `# Hello Angular 21! \n ## 標題一 \n - item1 \n - item2 \n **粗體** *斜體* \n\`\`\`html\n<div id="editor"><span>baz</span></div>\n\`\`\`
        `,
        plugins: [[codeSyntaxHighlight, { highlighter: Prism }], tableMergedCell],
        theme: 'dark',
        hooks: {
          // 攔截圖片上傳，改為上傳到後端 API
          addImageBlobHook: async (
            blob: Blob,
            callback: (url: string, altText?: string) => void,
          ) => {
            try {
              const imageUrl = await this.uploadImage(blob);
              // callback 會將圖片 URL 插入到編輯器中
              callback(imageUrl, 'image');
            } catch (error) {
              console.error('圖片上傳失敗:', error);
              alert('圖片上傳失敗，請稍後再試');
            }
          },
        },
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

  /**
   * 上傳圖片到後端 API
   * @param blob 圖片 Blob
   * @returns 圖片 URL
   */
  private async uploadImage(blob: Blob): Promise<string> {
    const formData = new FormData();

    // 產生檔名（使用時間戳記 + 原始副檔名）
    const extension = blob.type.split('/')[1] || 'png';
    const fileName = `image_${Date.now()}.${extension}`;
    formData.append('file', blob, fileName);

    // TODO: 請將這裡換成你的後端 API URL
    const apiUrl = '/api/upload/image';

    const response = await firstValueFrom(this.http.post<{ url: string }>(apiUrl, formData));

    // 假設後端回傳 { url: 'https://your-server.com/images/xxx.png' }
    return response.url;
  }
}
