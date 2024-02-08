import { Plugin, MarkdownView } from 'obsidian';
import { clipboard } from 'electron';
import fileUriToPath from 'file-uri-to-path';



export default class FilePathToUri extends Plugin 
{
	async onload() 
	{
		console.log('Loading plugin FilePathToUri...');



		this.addCommand(
		{
			id: 'convert-selected-path-to-uri-or-back',
			name: 'Convert selected path to URI or back',
			checkCallback: (checking: boolean) => 
			{
				if (this.getEditor() === null) {
					return;
				}

				if (!checking) {
					this.toggleLink();
				}

				return true;
			},
			hotkeys: [
				{
					modifiers: ['Mod', 'Alt', 'Shift'],
					key: 'U',
				},
			],
		});



		this.addCommand(
		{
			id: 'paste-path-as-URI-link-with-path-as-title',
			name: 'Paste path as URI link with path as title',
			checkCallback: (checking: boolean) => 
			{
				if (this.getEditor() === null) {
					return;
				}

				if (!checking) {
					this.pasteAsUriLink('pathTitle');
				}

				return true;
			},
			hotkeys: [
				{
					modifiers: ['Mod', 'Alt', 'Shift'],
					key: 'L',
				},
			],
		});



		this.addCommand(
		{
			id: 'paste-file-path-as-uri-link-with-filename-as-title',
			name: 'Paste file path as URI link with filename as title',
			checkCallback: (checking: boolean) => 
			{
				if (this.getEditor() === null) {
					return;
				}

				if (!checking) {
					this.pasteAsUriLink('filenameTitle');
				}

				return true;
			},
			hotkeys: [
				{
					modifiers: ['Mod', 'Shift'],
					key: 'L',
				},
			],
		})
	}



	getEditor() 
	{
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view || view.getMode() !== 'source') {
			return null;
		}

		// следующую строку поправил (класс MarkdownView утратил поле sourceMode). При этом исходный плагин работает как ни в чем не бывало. Да и у меня код транслируется в js несмотря на выведенную ошибку, и тоже работает. Наверное, это означает, что старой API продолжает работать, хотя из нового объявления класса его убрали. Забавно здесь это устроено.
		// return view.sourceMode.cmEditor;
		return view.editor;
	}



	makeLink(title:string, link:string) 
	{
		return `[${title}](${link})`
	}



	/**
	 * Does the text have any '\' or '/'?
	 */
	hasSlashes(text: string) 
	{
		// Does it have any '\' or '/'?
		const regexHasAnySlash = /.*([\\\/]).*/g;

		if (typeof text !== 'string') {
			return false;
		}

		let matches = text.match(regexHasAnySlash);
		return !!matches;
	}



	/**
	 * Trim whitespace and remove surrounding "
	 */
	cleanupText(text: string) 
	{
		if (typeof text !== 'string') {
			return '';
		}

		text = text.trim();

		// Remove surrounding "
		if (text.startsWith("'") || text.startsWith('"')) {
			text = text.substr(1);
		}
		if (text.endsWith("'") || text.endsWith('"')) {
			text = text.substr(0, text.length - 1);
		}

		return text;
	}



	fileUriToPathOrBack(text: string) 
	{
		let url = "";

		// file URI for network location file://\\location
		// Works for both 'file:///\\path' and 'file:///%5C%5Cpath'
		// Obsidian uses escape chars in link so `file:///\\location` will try to open `file:///\location instead
		// But the text we get contains the full string, thus the test for both 2 and 4 '\' chars
		if (
				text.startsWith('file:///\\\\') || 
				text.startsWith('file:///\\\\\\\\') ||
				text.startsWith('file:///%5C%5C')
		   ) 
		{
			// normalize to 'file:///'
			text = text.replace('file:///\\\\\\\\', 'file:///');
			text = text.replace('file:///\\\\', 'file:///');
			text = text.replace('file:///%5C%5C', 'file:///');

			// !!! выставление слешей при обратной конвертации происходит в зависимости от ОС (windows / linux)
			url = fileUriToPath(text);

			if (url) {
				// fileUriToPath returns only single leading '\' so we need to add the second one
				url = '\\' + url;
			}
		}
		// file URI file:///C:/Users
		else 
			if (text.startsWith('file:///')) {
				// !!! выставление слешей при обратной конвертации происходит в зависимости от ОС (windows / linux)
				url = fileUriToPath(text);
			}
			// network path '\\path'
			else 
				if (text.startsWith('\\\\')) 
				{
					let endsWithSlash =	text.endsWith('\\') || text.endsWith('/');
					// URL throws error on invalid url
					try 
					{
						let link = new URL(text);
	
						url = link.href.replace('file://', 'file:///%5C%5C');
						if (url.endsWith('/') && !endsWithSlash) {
							url = url.slice(0, -1);
						}
					} catch (e) {
						return;
					}
				}
				// path C:\Users\ or \System\etc
				else 
					// URL throws error on invalid url
					try 
					{
						let link = new URL('file://' + text);
						url = link.href;
					} catch (e) {
						return;
					}
					
		return url;
	}



	toggleLink() 
	{
		let editor = this.getEditor();
		if (editor == null || !editor.somethingSelected()) {
			return;
		}

		let selectedText = editor.getSelection();

		let selectedTextStartQuote = 0;
		if (selectedText.startsWith("'")) {
			selectedTextStartQuote = 1;
		} 
		if (selectedText.startsWith('"')) {
			selectedTextStartQuote = 2;
		} 

		let selectedTextEndQuote = 0;
		if (selectedText.endsWith("'")) {
			selectedTextEndQuote = 1;
		} 
		if (selectedText.endsWith('"')) {
			selectedTextEndQuote = 2;
		} 

		selectedText = this.cleanupText(selectedText);

		// !!! do nothing if it's not path
		if (!this.hasSlashes(selectedText)) {
			return;
		}

		let url = this.fileUriToPathOrBack(selectedText)

		if (url)
		{
			if (selectedTextStartQuote == 1) {
				url = "'" + url
			} 
			if (selectedTextStartQuote == 2) {
				url = '"' + url
			} 
	
			if (selectedTextEndQuote == 1) {
				url = url + "'"
			} 
			if (selectedTextEndQuote == 2) {
				url = url + '"'
			} 
			
			editor.replaceSelection(url, 'around');
		}
	}



	pasteAsUriLink(pathOrFilenameSelector: string) 
	{
		if (pathOrFilenameSelector !== 'pathTitle' && pathOrFilenameSelector !== 'filenameTitle') {
			return;
		}
	
		let editor = this.getEditor();
		if (editor == null) {
			return;
		}

		let clipboardText = clipboard.readText('clipboard');
		if (!clipboardText)	{
			return;
		}

		clipboardText = this.cleanupText(clipboardText);

		// !!! paste the text as usual if it's URI or not path
		if (clipboardText.startsWith('file:') || !this.hasSlashes(clipboardText)) 
		{
			editor.replaceSelection(clipboardText, 'around');
			return;
		}

		let uri = this.fileUriToPathOrBack(clipboardText)
		let title = "";

		let endsWithSlash = clipboardText.endsWith('\\') || clipboardText.endsWith('/');
		
		if (pathOrFilenameSelector == 'pathTitle' || endsWithSlash) {
			title = clipboardText;
			// https://stackoverflow.com/questions/1144783/how-do-i-replace-all-occurrences-of-a-string-in-javascript
			title = title.split('\\').join('\\\\'); // no need to do that for linux path title
			
		}else
			if (pathOrFilenameSelector == 'filenameTitle') {
					// https://stackoverflow.com/questions/8376525/get-value-of-a-string-after-last-slash-in-javascript
					title = /[^/\\]*$/.exec(clipboardText)[0]; 
			}
		
		if (uri) {
			editor.replaceSelection(this.makeLink(title, uri), 'around');
		}
		
	}



	onunload() {
		console.log('Unloading plugin FilePathToUri...');
	}
}
