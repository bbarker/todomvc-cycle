import intent from './intent';
import view from './view';
import {Stream} from "xstream";
import {VNode, DOMSource} from "@cycle/dom";
import model, {TaskProperties, TaskModel} from './model';
import {TaskAction} from "./actions";

export interface TaskSources {
  DOM: DOMSource,
  props$: Stream<TaskProperties>,
  action$: Stream<TaskAction>
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
  let action$ = intent(sources);
  let state$ = model(sources.props$, action$);
  let vtree$ = view(state$);

  return {
    DOM: vtree$,
    action$,
    state$
  };
}

export default Task;
