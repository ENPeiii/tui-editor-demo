import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MdEditor } from './shared/tui-editor/md-editor/md-editor';
import { MdViewer } from './shared/tui-editor/md-viewer/md-viewer';

@Component({
  selector: 'app-root',
  imports: [MdEditor, MdViewer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('tui-editor-demo');
  mdViewerContent = signal<string>('# Hello Angular 21! \n ## 標題一 \n - item1 \n - item2 \n **粗體** *斜體* \n ```js \n console.log("Hello World!"); \n ```');

  onEditorContent(content: string) {
    console.log('content', content);
    this.mdViewerContent.set(content);
  }
}
