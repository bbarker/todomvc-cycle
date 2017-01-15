import xs from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
import * as cycleHistory from '@cycle/history'
import {ENTER_KEY, ESC_KEY} from '../../utils';
import {Stream} from "xstream";

import {
  TaskListAction,
  ChangeRouteAction, isChangeRouteAction,
  UrlAction, isUrlAction,
  ClearInputAction, isClearInputAction,
  InsertTodoAction, isInsertTodoAction,
  ToggleTodoAction, isToggleTodoAction,
  DeleteTodoAction, isDeleteTodoAction,
  EditTodoAction, isEditTodoAction,
  ToggleAllAction, isToggleAllAction,
  DeleteCompletedsAction, isDeleteCompletedsAction,
  toTaskListAction,
} from './actions';
import {TaskAction, isToggleAction, isDestroyAction, isDoneEditAction} from "../Task/actions";
import {DOMSource} from "../../cycle-dom-xstream";

// THE INTENT FOR THE LIST
export default function intent(domSource: DOMSource<any>, History: Stream<cycleHistory.Location>): Stream<TaskListAction> {
  return xs.merge<TaskListAction>(
    // THE ROUTE STREAM
    // A stream that provides the path whenever the route changes.
    History
      .startWith({pathname: '/'})
      .map(location => location.pathname)
      .compose(dropRepeats())
      .map(payload => <ChangeRouteAction> ({type: 'changeRoute', payload})),

    // THE URL STREAM
    // A stream of URL clicks in the app
    domSource.select('a').events('click')
      .map(event =>  event.target.hash.replace('#', ''))
      .map(payload => (<TaskListAction> {type: 'url', payload})),

    // CLEAR INPUT STREAM
    // A stream of ESC key strokes in the `.new-todo` field.
    domSource.select('.new-todo').events('keydown')
      .filter(ev => ev.keyCode === ESC_KEY)
      .map(payload => (<TaskListAction> {type: 'clearInput', payload})),

    // ENTER KEY STREAM
    // A stream of ENTER key strokes in the `.new-todo` field.
    domSource.select('.new-todo').events('keydown')
      // Trim value and only let the data through when there
      // is anything but whitespace in the field and the ENTER key was hit.
      .filter(ev => {
        let trimmedVal = String(ev.target.value).trim();
        return ev.keyCode === ENTER_KEY && !!trimmedVal;
      })
      // Return the trimmed value.
      .map(ev => String(ev.target.value).trim())
      .map(payload => <InsertTodoAction> ({type: 'insertTodo', payload})),

    // TOGGLE ALL STREAM
    // Create a stream out of the clicks on the `.toggle-all` button.
    domSource.select('.toggle-all').events('click')
      .map(ev => ev.target.checked)
      .map(payload => (<TaskListAction>  {type: 'toggleAll', payload})),

    // DELETE COMPLETED TODOS STREAM
    // A stream of click events on the `.clear-completed` element.
    domSource.select('.clear-completed').events('click')
      .mapTo(<TaskListAction> {type: 'deleteCompleteds'})
  );
};
