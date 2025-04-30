// class HistoryService {
//     constructor() {
//         this.history = [];
//         this.currentIndex = -1;
//         this.maxHistoryLength = 50;
//         this.isUndoRedoInProgress = false;
//     }

//     pushState(state) {
//         if (this.isUndoRedoInProgress) return;
//         if (this.currentIndex < this.history.length - 1) {
//             this.history = this.history.slice(0, this.currentIndex + 1);
//         }
//         this.history.push(JSON.parse(JSON.stringify(state)));
//         this.currentIndex++;
//         if (this.history.length > this.maxHistoryLength) {
//             this.history.shift();
//             this.currentIndex--;
//         }
//         this.updateUI();
//     }

//     undo() {
//         if (this.canUndo()) {
//             this.isUndoRedoInProgress = true;
//             this.currentIndex--;
//             const previousState = JSON.parse(JSON.stringify(this.history[this.currentIndex]));
//             this.isUndoRedoInProgress = false;
//             this.updateUI();
//             return previousState;
//         }
//         return null;
//     }

//     redo() {
//         if (this.canRedo()) {
//             this.isUndoRedoInProgress = true;
//             this.currentIndex++;
//             const nextState = JSON.parse(JSON.stringify(this.history[this.currentIndex]));
//             this.isUndoRedoInProgress = false;
//             this.updateUI();
//             return nextState;
//         }
//         return null;
//     }

//     canUndo() {
//         return this.currentIndex > 0;
//     }

//     canRedo() {
//         return this.currentIndex < this.history.length - 1;
//     }

//     updateUI() {
//         const undoButton = document.getElementById('undo-button');
//         const redoButton = document.getElementById('redo-button');

//         if (undoButton) {
//             undoButton.disabled = !this.canUndo();
//             undoButton.classList.toggle('disabled', !this.canUndo());
//         }

//         if (redoButton) {
//             redoButton.disabled = !this.canRedo();
//             redoButton.classList.toggle('disabled', !this.canRedo());
//         }
//     }

//     getCurrentState() {
//         return this.currentIndex >= 0 ? JSON.parse(JSON.stringify(this.history[this.currentIndex])) : null;
//     }

//     clear() {
//         this.history = [];
//         this.currentIndex = -1;
//         this.updateUI();
//     }

//     getHistoryLength() {
//         return this.history.length;
//     }

//     getCurrentIndex() {
//         return this.currentIndex;
//     }
// }

// const styles = `
//     .history-button {
//         background: none;
//         border: none;
//         color: #fff;
//         padding: 8px 12px;
//         cursor: pointer;
//         transition: all 0.3s ease;
//         opacity: 0.7;
//     }

//     .history-button:hover:not(.disabled) {
//         opacity: 1;
//     }

//     .history-button.disabled {
//         opacity: 0.3;
//         cursor: not-allowed;
//     }

//     .history-button i {
//         font-size: 1.2rem;
//     }
// `;

// const styleSheet = document.createElement('style');
// styleSheet.textContent = styles;
// document.head.appendChild(styleSheet);

// function createHistoryButtons() {
//     const historyControls = document.createElement('div');
//     historyControls.className = 'history-controls';
//     historyControls.innerHTML = `
//         <button id="undo-button" class="history-button" title="Annuler">
//             <i class="fas fa-undo"></i>
//         </button>
//         <button id="redo-button" class="history-button" title="Rétablir">
//             <i class="fas fa-redo"></i>
//         </button>
//     `;

//     const header = document.querySelector('header');
//     if (header) {
//         header.appendChild(historyControls);
//     }

//     document.getElementById('undo-button').addEventListener('click', () => {
//         const previousState = historyService.undo();
//         if (previousState) {
//             window.galleryItems = previousState.items;
//             window.filteredItems = [...window.galleryItems];
//             loadGallery();
//         }
//     });

//     document.getElementById('redo-button').addEventListener('click', () => {
//         const nextState = historyService.redo();
//         if (nextState) {
//             window.galleryItems = nextState.items;
//             window.filteredItems = [...window.galleryItems];
//             loadGallery();
//         }
//     });
// }

// const historyService = new HistoryService();

// export { historyService, createHistoryButtons }; 