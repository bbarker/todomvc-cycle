import intent from './intent';
import view from './view';
import {Stream} from "xstream";
import {VNode} from "@cycle/dom";
import model, {TaskProperties, TaskModel} from './model';
import {TaskAction} from "./actions";
import {DOMSource} from "../../cycle-dom-xstream";

export interface TaskSources {
  DOM: DOMSource<any>,
  props$: Stream<TaskProperties>
}

interface TaskSinks {
  DOM: Stream<VNode>,
  action$: Stream<TaskAction>,
  state$: Stream<TaskModel>
}
// THE TODO ITEM FUNCTION
// This is a simple todo item component,
// structured with the MVI-pattern.
function Task(sources: TaskSources): TaskSinks {
  let action$ = intent(sources.DOM);
  let state$ = model(sources.props$, action$);
  let vtree$ = view(state$);

  return {
    DOM: vtree$,
    action$,
    state$
  };
}

export default Task;
