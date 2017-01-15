import xs from 'xstream';

import {TaskAction, ToggleAction} from "./actions";
import {Stream} from "xstream";

export interface TaskProperties {
  title: string,
  completed: boolean
}

export interface TaskModel {
  title: string,
  isCompleted: boolean,
  isEditing: boolean
}

function model(props$: Stream<TaskProperties>, action$: Stream<TaskAction>): Stream<TaskModel> {
  // THE SANITIZED PROPERTIES
  // If the list item has no data set it as empty and not completed.
  let sanitizedProps$ = props$.startWith({title: '', completed: false});

  // THE EDITING STREAM
  // Create a stream that emits booleans that represent the
  // "is editing" state.
  let editing$: Stream<boolean> =
    xs.merge(
      action$.filter(a => a.type === 'startEdit').mapTo(true),
      action$.filter(a => a.type === 'doneEdit').mapTo(false),
      action$.filter(a => a.type === 'cancelEdit').mapTo(false),
      action$.filter(a => a.type === 'toggle').map(a => !!((<ToggleAction> a).payload))
    ).startWith(false);



  return xs.combine(sanitizedProps$, editing$)
    .map(function (data: [TaskProperties, boolean]): TaskModel {
      let [{title, completed}, editing] = data;
      return {
        title,
        isCompleted: completed,
        isEditing: editing,
      };
    });
}
export default model;
