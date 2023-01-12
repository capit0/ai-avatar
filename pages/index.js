// Add useEffect here
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import buildspaceLogo from '../assets/buildspace-logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';


const Home = () => {
  const maxRetries = 40;

  const [input, setInput] = useState('');
  const [img, setImg] = useState('');

  const [retry, setRetry] = useState(0);
  // Number of retries left
  const [retryCount, setRetryCount] = useState(maxRetries);

  const [isGenerating, setIsGenerating] = useState(false);

  const [finalPrompt, setFinalPrompt] = useState('');

  const [showModal, setShowModal] = useState(false);

  const onChange = (event) => {
    setInput(event.target.value);
  };

  const generateAction = async () => {
    console.log('Generating...');

    // Add this check to make sure there is no double click
    if (isGenerating && retry === 0) return;

    // Set loading has started
    setIsGenerating(true);

    // If this is a retry request, take away retryCount
    if (retry > 0) {
      setRetryCount((prevState) => {
        if (prevState === 0) {
          return 0;
        } else {
          return prevState - 1;
        }
      });

      setRetry(0);
    }

    const finalInput = input.replace("a chad", 'man sne1z');
    console.log(finalInput)

    // Add the fetch request
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: JSON.stringify({ input: finalInput }),
    });

    console.log(response)


    const data = await response.json();

    // If model still loading, drop that retry time
    if (response.status === 503) {
      setRetry(data.estimated_time);
      return;
    }

    // If another error, drop error
    if (!response.ok) {
      console.log(`Error: ${data.error}`);
      setIsGenerating(false);
      return;
    }

    // Set final prompt here
    setFinalPrompt(input);
    // Remove content from input box
    setInput('');

    setImg(data.image);

    setIsGenerating(false);
  };

  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
  }


  useEffect(() => {
    const runRetry = async () => {
      if (retryCount === 0) {
        console.log(`Model still loading after ${maxRetries} retries. Try request again in 5 minutes.`);
        setRetryCount(maxRetries);
        return;
      }

      console.log(`Trying again in ${retry} seconds.`);

      await sleep(retry * 1000);

      await generateAction();
    };

    if (retry === 0) {
      return;
    }

    runRetry();
    document.addEventListener("mousedown", handleClickOutside);
    // here you need to return a function that will remove the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [retry, showModal]);

  return (
    <div className="root">
      <Head>
        {/* Add one-liner here */}
        <title>Chad Productions</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            {/* Add one-liner here */}
            <h1>Chad Generator</h1>
          </div>
          <div className="header-subtitle">
            {/* Add description here */}
            <h2>
              Describe any type of charachter and use "a chad" as the name of your subject
            </h2>
            <div className="flex-container">
              <div className="prompt-container">
                <input className="prompt-box" placeholder="It needs a couple shots before it hits a homerun, give it some tries and get creative.." value={input} onChange={onChange} />
                <div className="prompt-buttons">
                  {/* Tweak classNames to change classes */}
                  <a
                    className={
                      isGenerating ? 'generate-button loading' : 'generate-button'
                    }
                    style={{ color: 'black' }}
                    onClick={generateAction}
                  >
                    {/* Tweak to show a loading indicator */}
                    <div className="generate-button" style={{ color: 'black' }}>
                      {isGenerating ? (
                        <span className="loader"></span>
                      ) : (
                        <p color="black">Generate</p>
                      )}
                    </div>
                  </a>
                </div>
                <button className="modal-button" onClick={() => setShowModal(true)}>
                  <FontAwesomeIcon icon={faInfoCircle} color="white" size="2x" />
                </button>
                {showModal && (
                  <div className="modal">
                    <button className="normal-button" onClick={handleModalClose}>
                      <FontAwesomeIcon icon={faTimes} color="black" size="1x" />
                    </button>
                    <div className="modal-content">
                      <h2 className="text-base mt-2 mx-4 text-gray-400 font-semibold text-center">
                        Correctly promping a linguistic model is a skill!  <p class="sub-text">A way to aim for good results is by starting with the TYPE of image, then the subject (a chad in this case) with its particular features, then the BACKGROUND, followed by the ADJECTIVES, and finally the ARTSTYLE. Here is an example of a prompt that is a good basis to experiment with:</p>
                        <ul class="example">
                          <li>a digital illustration of a chad in the clouds, intricate, fantasy, elegant, highly detailed, digital painting, artstation, concept art, smooth, sharp focus, illustration, art by artgerm and greg rutkowski and alphonse mucha</li>
                        </ul>

                        <h2 className="text-base mt-2 mx-4 text-gray-400 font-semibold text-center"> Here are some more prompts to get your imagination going:</h2>
                        <ul class="bullet-points">
                          <li>TYPE</li>
                          <p class="examples">a digital illustration, a photo, oil painting, a candid profile, pencil drawing </p>
                          <li>BACKGROUND</li>
                          <p class="examples">a steampunk library with clockwork machines, a medieval town, a waterfall in the woods, a beach with sunset</p>
                          <li>ADJECTIVES</li>
                          <p class="examples">vivid colors, detailed, hyperrealistic uhd, fantasy, concept art, photorealistic, trending on artstation </p>
                          <li>ARTSTYLE</li>
                          <p class="examples">Josef Thoma, Greg Rutkowski, Aaron Horkey, Dan Mumford</p>
                        </ul>
                      </h2>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {img && (
          <div className="output-content">
            <Image src={img} width={512} height={512} alt={finalPrompt} />
            {/* Add prompt here */}
            <p>{finalPrompt}</p>
          </div>
        )}
      </div>
      <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-avatar"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>build with buildspace</p>
          </div>
        </a>
      </div>
    </div >
  );
};

export default Home;
