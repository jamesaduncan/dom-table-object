import SelectorSubscriber from "https://jamesaduncan.github.io/selector-subscriber/index.mjs";
import TableQuery from "./index.mjs"

Object.defineProperty(HTMLInputElement.prototype, 'caretPosition', {
    set(caretPos) {
        if ( this.createTextRange ) {
            const range = this.createTextRange();
            range.move('character', caretPos);
            range.select();
        } else {
            if( this.selectionStart ) {
                this.focus();
                this.setSelectionRange(caretPos, caretPos);
            } else this.focus();
        }
    }
});

SelectorSubscriber.subscribe('input[vlookup]', ( anInput ) => {

    anInput.addEventListener('keyup', (e) => {
        /* as it is an input, its the source */
        let dataSource = document.querySelector( e.target.getAttribute('vlookup') );
        if ( dataSource.nodeName === 'TEMPLATE' ) {
            dataSource = dataSource.content.querySelector('table');
        }
        const tq = new TableQuery(dataSource);

        if (['Control', 'Meta', 'Shift', 'Alt', 'Backspace'].includes( e.key )) return;
        if (e.target.value) {                                

            const [normalized, result] = tq.query(e.target.value, { normalize: true });
            
            if ( result ) {
                const destinations = document.querySelectorAll(`[vlookup="${e.target.getAttribute('vlookup')}"][vlookup-query-index]`);                
                for ( const destination of destinations ) {
                    const offset = destination.getAttribute('vlookup-query-index');
                    const result = tq.query(e.target.value, { offsetColumn: offset} );
                    if (destination != e.target) {
                        switch( destination.nodeName ) {
                            case "INPUT":
                                destination.value = result;
                                break;
                            default:
                                destination.innerHTML = result;
                        }
                    }
                }                
                const selStart = e.target.value.length;
                const selEnd   = normalized.length;

                e.target.caretPosition = selStart;
                e.target.value = normalized;
                e.target.setSelectionRange(selStart, selEnd, 'forward');
            } else { return }
        }
    })        
});