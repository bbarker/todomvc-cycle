import xs from 'xstream';
import {ENTER_KEY, ESC_KEY} from '../../utils';
import {Stream} from "xstream";
import {TaskAction, ToggleAction} from "./actions";
import {TaskSources} from "./index"
import {DOMSource} from "../../cycle-dom-xstream";

// THE TODO ITEM INTENT
// This intent function returns a stream of all the different,
// actions that can be taken on a todo.
function intent(domSource: DOMSource<any>): Stream<TaskAction> {
  // THE INTENT MERGE
  // Merge all actions into one stream.
  return xs.merge<TaskAction>(
    // THE DESTROY ACTION STREAM
    domSource.select('.destroy').events('click')
      .mapTo(<TaskAction> {type: 'destroy'}),

    // THE TOGGLE ACTION STREAM
    domSource.select('.toggle').events('change')
      .mapTo(<TaskAction> {type: 'toggle'}),

    domSource.action$
      .filter(action => action.type === "toggle")
      .map(action => <TaskAction> ({...action, type: 'toggle'})),

    // THE START EDIT ACTION STREAM
    domSource.select('label').events('dblclick')
      .mapTo(<TaskAction> {type: 'startEdit'}),

    // THE ESC KEY ACTION STREAM
    domSource.select('.edit').events('keyup')
      .filter(ev => ev.keyCode === ESC_KEY)
      .mapTo(<TaskAction> {type: 'cancelEdit'}),

    // THE ENTER KEY ACTION STREAM
    domSource.select('.edit').events('keyup')
      .filter(ev => ev.keyCode === ENTER_KEY)
      .compose(s => xs.merge(s, domSource.select('.edit').events('blur', true)))
      .map(ev => (<TaskAction> {title: ev.target.value, type: 'doneEdit'}))
  );
}

export default intent;
