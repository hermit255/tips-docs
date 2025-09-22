import chokidar from 'chokidar'

export class FileWatcher {
  private watcher: chokidar.FSWatcher | null = null
  private callbacks: Array<() => void> = []

  constructor() {
    this.setupWatcher()
  }

  private setupWatcher() {
    this.watcher = chokidar.watch(['docs/**/*.md', 'terms/**/*.md'], {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true
    })

    this.watcher.on('change', (path) => {
      console.log(`File changed: ${path}`)
      this.notifyCallbacks()
    })

    this.watcher.on('add', (path) => {
      console.log(`File added: ${path}`)
      this.notifyCallbacks()
    })

    this.watcher.on('unlink', (path) => {
      console.log(`File removed: ${path}`)
      this.notifyCallbacks()
    })
  }

  public onFileChange(callback: () => void) {
    this.callbacks.push(callback)
  }

  public removeCallback(callback: () => void) {
    const index = this.callbacks.indexOf(callback)
    if (index > -1) {
      this.callbacks.splice(index, 1)
    }
  }

  private notifyCallbacks() {
    this.callbacks.forEach(callback => callback())
  }

  public close() {
    if (this.watcher) {
      this.watcher.close()
      this.watcher = null
    }
  }
}

// シングルトンインスタンス
export const fileWatcher = new FileWatcher()
