import React from 'react';
import './App.css';
import { setup, assign } from 'xstate';
import { useMachine } from '@xstate/react';

const machine = setup({
  actions: {
    setFeedbackText: assign({
      feedback: ({ event }) => event.value
    })
  }
}).createMachine({
  id: 'feedbackFlow',
  context: {
    feedback: ''
  },
  initial: 'prompt',
  states: {
    prompt: {
      on: {
        'feedback.good': { target: 'thanks' },
        'feedback.bad': { target: 'form' },
        close: { target: 'closed' }
      }
    },
    form: {
      on: {
        back: { target: 'prompt' },
        submit: { target: 'thanks' },
        close: { target: 'closed' },
        'feedback.change': { actions: 'setFeedbackText' }
      }
    },
    thanks: {
      on: {
        restart: { target: 'prompt' }
      }
    },
    closed: {
      on: {
        restart: { target: 'prompt' }
      }
    }
  }
});

function Form() {
  const [state, send] = useMachine(machine);

  return (
    <div>
      {state.matches('prompt') && (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="p-4 border border-gray-300 rounded-md w-64 bg-white shadow-md">
            <h3 className="text-lg font-semibold mb-3">How was your experience?</h3>

            <div className="flex flex-col gap-2 mb-4">
              <button
                className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => send({ type: 'feedback.good' })}
              >
                Good
              </button>

              <button
                className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => send({ type: 'feedback.bad' })}
              >
                Bad
              </button>
            </div>

            <button
              className="py-2 px-4 bg-gray-400 text-white rounded hover:bg-gray-500 w-full"
              onClick={() => send({ type: 'close' })}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {state.matches('thanks') && (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="p-4 border border-gray-300 rounded-md w-64 bg-white shadow-md text-center">
            <h1 className="text-lg font-semibold mb-3">Thanks for the review!</h1>

            <button
              className="py-2 px-4 bg-gray-400 text-white rounded hover:bg-gray-500"
              onClick={() => send({ type: 'restart' })}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {state.matches('form') && (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="p-4 border border-gray-300 rounded-md w-64 bg-white shadow-md flex flex-col gap-2">
            <p>Sorry to hear that! You can leave additional feedback:</p>

            <textarea
              className="border border-gray-300 p-2 rounded"
              placeholder="Your feedback..."
              value={state.context.feedback}
              onChange={(e) =>
                send({ type: 'feedback.change', value: e.target.value })
              }
            />

            <div className="flex gap-2 mt-2">
              <button
                className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => send({ type: 'submit' })}
              >
                Submit
              </button>

              <button
                className="py-2 px-4 bg-gray-400 text-white rounded hover:bg-gray-500"
                onClick={() => send({ type: 'back' })}
              >
                Back
              </button>
            </div>

            <button
              className="py-2 px-4 bg-gray-400 text-white rounded hover:bg-gray-500"
              onClick={() => send({ type: 'close' })}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {state.matches('closed') && (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="p-4 border border-gray-300 rounded-md w-64 bg-white shadow-md text-center">
            <h1 className="text-lg font-semibold mb-3">Closed</h1>
            <button
              className="py-2 px-4 bg-gray-400 text-white rounded hover:bg-gray-500"
              onClick={() => send({ type: 'restart' })}
            >
              Restart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Form;
