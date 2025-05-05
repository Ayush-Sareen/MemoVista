import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Navbar from "./components/Navbar";
import { ToastContainer, toast } from 'react-toastify';

const App = () => {
  const [referenceString, setReferenceString] = useState("");
  const [frames, setFrames] = useState(3);
  const [results, setResults] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [autoInterval, setAutoInterval] = useState(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("FIFO");

  const pageFaults = results[selectedAlgorithm]?.page_faults || 0;
  const totalReferences = results[selectedAlgorithm]?.memory_states?.length || 0;
  const pageHits = totalReferences - pageFaults;
  const hitRatio = totalReferences > 0 ? (pageHits / totalReferences).toFixed(2) : 0;
  const missRatio = 1 - hitRatio;

  const algorithms = ["FIFO", "LRU", "Optimal"];

  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;

  const simulateAll = async () => {
    if (!referenceString) {
      toast.error('Enter Valid String !', {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        });
    }
    const refList = referenceString.split(",").map(num => parseInt(num.trim()));
    const newResults = {};

    for (const algo of algorithms) {
      const res = await axios.post("http://127.0.0.1:5000/simulate", {
        algorithm: algo,
        reference_string: refList,
        frames: parseInt(frames),
      });
      newResults[algo] = res.data;
    }

    setResults(newResults);
    setCurrentStep(0);
    toast.success('Simulation Sucessfull !', {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      });
  };

  useEffect(() => {
    simulateAll();
  }, []);

  const goToNextStep = () => {
    if (currentStep < results[selectedAlgorithm]?.memory_states.length - 1) {
      setCurrentStep(currentStep + 1);
    }
    else{
      toast.success('Simulation Completed !', {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startAuto = () => {
    if (!isAutoRunning) {
      setIsAutoRunning(true);
      const totalSteps = results[selectedAlgorithm]?.memory_states.length || 0;

      const intervalId = setInterval(() => {
        if (currentStepRef.current < totalSteps - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          clearInterval(intervalId);
          setIsAutoRunning(false);
          toast.success('Simulation Completed !', {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            });
        }
      }, 1000);
      setAutoInterval(intervalId);
    }
  };

  const stopAuto = () => {
    if (autoInterval) {
      clearInterval(autoInterval);
      setIsAutoRunning(false);
    }
  };

  const resetSimulation = () => {
    setCurrentStep(0);
    setIsAutoRunning(false);
    if (autoInterval) {
      clearInterval(autoInterval);
      setAutoInterval(null);
      toast.warn('Simulation Was Reset !', {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        });
    }
  };

  return (

    <div className="bg-gray-900 text-gray-300 ">
      <ToastContainer
position="bottom-right"
autoClose={5000}
hideProgressBar={false}
newestOnTop={false}
closeOnClick={false}
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="dark"
/>
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className=' text-7xl bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text'>Virtual Memory Simulator</h1>
        <div className="border p-4 rounded-2xl shadow bg-gray-800">

        <div className="text-2xl font-semibold mb-4 text-center text-teal-400 ">ENTER DATA</div>
        <div className="flex flex-wrap gap-4 items-center justify-center">
          <label className="font-semibold" htmlFor="referenceString">Reference String:</label>
          <input
            id="referenceString"
            placeholder="Enter Reference String (1,3,0,3,5)"
            value={referenceString}
            onChange={(e) => setReferenceString(e.target.value)}
            className="border px-3 py-1 flex-1 rounded-2xl"
            />
          <label className="font-semibold" htmlFor="frames">Frames:</label>
          <input
            type="number"
            value={frames}
            onChange={(e) => setFrames(e.target.value)}
            className="border px-3 py-1 w-24 rounded-2xl"
            />
          <div className="flex gap-4 items-center">
            <label className="font-medium">Select Algorithm:</label>
            <select
              value={selectedAlgorithm}
              onChange={(e) => {
                setSelectedAlgorithm(e.target.value);
                setCurrentStep(0);
              }}
              className="border px-3 py-1 rounded-full"
              >
              {algorithms.map((algo) => (
                <option key={algo} value={algo} className="text-gray-900">
                  {algo}
                </option>
              ))}

            </select>
          </div>
          <button onClick={simulateAll} className="relative w-1/2 inline-flex text-lg items-center justify-center p-0.5 mb-2 me-2 overflow-hidden  font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
            <span className="relative w-full px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
              Simulate !
            </span>
          </button>
              </div>
        </div>

        {results[selectedAlgorithm] && (
          <div className="border p-4 rounded-2xl shadow mt-6 bg-gray-800">
            <h2 className="text-3xl text-teal-400 font-semibold mb-2 text-center">{selectedAlgorithm}</h2>
            <p>
              <strong>Page Faults:</strong> {pageFaults}<br />
              <strong>Page Hits:</strong> {pageHits}<br />
              <strong>TLB Hits:</strong> {results[selectedAlgorithm]?.tlb_hits || 0}<br />
              <strong>Hit Ratio:</strong> {hitRatio}<br />
              <strong>Miss Ratio:</strong> {missRatio}
            </p>

            <div className="grid grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] gap-4 mt-4 text-gray-800">
              {results[selectedAlgorithm]?.memory_states.slice(0, currentStep + 1).map((step, index) => (
                <div
                  key={index}
                  className={`border p-2 rounded-3xl transition duration-300 ${step.status === "Page Fault" ? "bg-red-200" : "bg-green-200"}`}
                >
                  <div><strong>Step {index + 1}</strong></div>
                  <div>Accessed Page: <span className="font-medium text-indigo-700">{step.added}</span></div>
                  <div>
                    <strong>Memory:</strong> {step.memory.join(", ")}
                  </div>
                  <div>
                    <strong>TLB Contents:</strong> {step.tlb_contents ? step.tlb_contents.join(", ") : "None"}
                  </div>
                  {step.evicted !== null && (
                    <div>
                      Evicted: <span className="text-yellow-700">{step.evicted}</span>
                    </div>
                  )}
                  <div>
                    Status:{" "}
                    <span className={`font-semibold ${step.status === "Page Fault" ? "text-red-600" : "text-green-600"}`}>
                      {step.status}
                    </span>
                  </div>
                  <div>
                    TLB:{" "}
                    <span className={`font-semibold ${step.tlb_status === "TLB Hit" ? "text-blue-600" : "text-gray-600"}`}>
                      {step.tlb_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center items-center mt-4 gap-4">
          <button onClick={goToPreviousStep} className="relative w-1/5  inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden  font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800">
            <span className="relative w-full px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
              Backward
            </span>
          </button>
          <button onClick={startAuto} disabled={isAutoRunning} className="relative w-1/5  inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden  font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800">
            <span className="relative w-full px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
              Auto
            </span>
          </button>
          <button type="button" onClick={stopAuto} disabled={!isAutoRunning} className=" w-1/5 text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg  px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900">Stop</button>
          <button onClick={resetSimulation} className="relative w-1/5  inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden  font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-lime-800">
            <span className="relative w-full px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
              Reset
            </span>
          </button>
          <button onClick={goToNextStep} className="relative w-1/5  inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden  font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800">
            <span className="relative w-full px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
              Forward
            </span>
          </button>
        </div>

        <div className="bg-teal-950 p-4">
        <div className="m-4 text-center">
          <p className="text-gray-200 text-2xl">Comparision Graph</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={algorithms.map((algo) => ({
              name: algo,
              faults: results[algo]?.page_faults || 0,
            }))} 
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" label={{ value: "Algorithm", position: "insideBottom", offset: -5 }} />
            <YAxis allowDecimals={false} label={{ value: "Page Faults", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Bar dataKey="faults" fill="#3182CE" />
          </BarChart>
        </ResponsiveContainer>

        <div className="text-center mt-4">
          <p className="text-gray-300">The Above Chart Shows The Number Of Page Faults For Each Algorithm.</p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default App;

