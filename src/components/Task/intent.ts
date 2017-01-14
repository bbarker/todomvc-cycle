import xs from 'xstream';
import {ENTER_KEY, ESC_KEY} from '../../utils';
import {DOMSource} from "@cycle/dom";
import {Stream} from "xstream";
import {TaskAction, ToggleAction} from "./actions";
import {TaskSources} from "./index"

// THE TODO ITEM INTENT
// This intent function returns a stream of all the different,
// actions that can be taken on a todo.
function intent(sources: TaskSources): Stream<TaskAction> {
  // THE INTENT MERGE
  // Merge all actions into one stream.
  return xs.merge<TaskAction>(
    // THE DESTROY ACTION STREAM
    sources.DOM.select('.destroy').events('click')
      .mapTo({type: 'destroy'}),

    // THE TOGGLE ACTION STREAM
    sources.DOM.select('.toggle').events('change')
      .map(ev => ev.target.checked)
      .map(payload => ({type: 'toggle', payload})),
    sources.action$
      .filter(action => action.type === "toggle")
      .map(action => <TaskAction> ({...action, type: 'toggle'})),

    // THE START EDIT ACTION STREAM
    sources.DOM.select('label').events('dblclick')
      .mapTo({type: 'startEdit'}),

    // THE ESC KEY ACTION STREAM
    sources.DOM.select('.edit').events('keyup')
      .filter(ev => ev.keyCode === ESC_KEY)
      .mapTo({type: 'cancelEdit'}),

    // THE ENTER KEY ACTION STREAM
    sources.DOM.select('.edit').events('keyup')
      .filter(ev => ev.keyCode === ENTER_KEY)
      .compose(s => xs.merge(s, sources.DOM.select('.edit').events('blur', true)))
      .map(ev => ({title: ev.target.value, type: 'doneEdit'}))
  );
}

export default intent;
