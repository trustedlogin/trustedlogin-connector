import React from 'react';

export const PageError = ({onClick}) => {
  
  return(
    <div class="flex flex-col justify-center text-center w-full max-w-lg mx-auto p-8 bg-white rounded-lg shadow sm:p-14">
                <svg class="mx-auto text-red-700" width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4" width="48" height="48" rx="24" fill="currentColor"></rect>
                    <path d="M28 24.4V28M28 31.6H28.009M37 28C37 32.9706 32.9706 37 28 37C23.0294 37 19 32.9706 19 28C19 23.0294 23.0294 19 28 19C32.9706 19 37 23.0294 37 28Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                    <rect x="4" y="4" width="48" height="48" rx="24" stroke="#FEE4E2" stroke-width="8"></rect>
                </svg>
                <h2 class="mt-4 text-2xl text-gray-900">
                    Uh oh!
                    <br>
                    Something went wrong.
                </h2>
                <p class="mt-2 mb-8 text-sm text-gray-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ornare tortor in nisl fermentum.</p>
                <button 
                  onClick={onClick}
                type="button" class="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-lg text-white bg-red-700 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-sky-500 sm:text-sm">
                    Try again
                </button>
            </div>
    );
}

export const ScreenError = ({heading,text,retryClick,learnMoreLink,isDismissible = false}) => {
  const [isDismissed,setIsDismissed]=false;
  if( isDimissed ){
    return null;
  }
  return (
    <div class="rounded-md bg-red-50 p-4 border border-red-300">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="text-red-700" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.0003 6.66663V9.99996M10.0003 13.3333H10.0087M18.3337 9.99996C18.3337 14.6023 14.6027 18.3333 10.0003 18.3333C5.39795 18.3333 1.66699 14.6023 1.66699 9.99996C1.66699 5.39759 5.39795 1.66663 10.0003 1.66663C14.6027 1.66663 18.3337 5.39759 18.3337 9.99996Z" stroke="currentColor" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-700">{heading}</h3>
                      {text ? (
                          <div class="mt-2 text-sm text-red-500">
                              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid pariatur, ipsum similique veniam.</p>
                          </div>
                      ) : null}
{retryClick || learnMoreLink ?
                        <div class="mt-4">
                            <div class="-my-1.5 flex">
  {learnMoreLink ? <button type="button" class="py-1.5 rounded-md text-sm font-medium text-red-700 hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-red-600">Learn more</button> : null}
{retryClick ? (<button
  onClick={retryClick}
type="button" class="ml-3 py-1.5 rounded-md text-sm font-medium text-red-700 hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-red-600">
                                    Try again
                                    <span aria-hidden="true">→</span>
                                </button>): null}
                            </div>
                        </div>
: null }
                    </div>
{isDismissible ?
                    <div class="ml-auto pl-3">
                        <div class="-mx-1.5 -my-1.5">
                            <button
  onClick={setIsDismissed}
  type="button" class="inline-flex rounded-md p-1.5 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-red-600">
                                <span class="sr-only">Dismiss</span>
                                <!-- Heroicon name: solid/x -->
                                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
: null}
                </div>
            </div>
    );
