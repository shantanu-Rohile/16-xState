import React from 'react';
import './App.css';
import { setup, assign, fromPromise } from 'xstate';
import { useMachine } from '@xstate/react';
import { after } from 'node:test';

const machine = setup({
    guards: {
    feedbackValid: ({ context }) => {
      return context.feedback.trim().length > 0;
    }
  },
  actions: {
    setFeedbackText: assign({
      feedback: ({ event }) => event.value
    }),
  actors:{
    sendFeedback:fromPromise(async () =>{
      await new Promise((r)=>setTimeout(r,1000));
      return {status:200};
    }),
  }
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
        submit: {
          guard: 'feedbackValid',
          target: 'submitting'
        }, 
        close: { target: 'closed' },
        'feedback.update':{
          actions:assign(({event})=>{
            return {
              feedback:event.value
            }
          })
        }
      }
    },
    submitting:{
        invoke:{
          src:'sendFeedback',
          onDone:{
            target:'thanks'
          },
          
        },
        after:{
            2000:{
              target:'error'
            }
        }
       
    },
    error:{

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
    },
    sendFeedback:{
      
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
     
      {state.matches('error') && (
        <div>
         <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="p-4 border border-gray-300 rounded-md w-64 bg-white shadow-md text-center">
            <h1 className="text-lg font-semibold mb-3">Something went wrong...</h1>
          </div>
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
                send({ type: 'feedback.update', value: e.target.value })
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
          <p>{state.context.feedback}</p>
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
