import React, { useState, useEffect, useRef } from "react";
import { shuffleArray, shuffleQuestionOptions } from "../helper/quizHelper";

import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import QuizSection from "./QuizSection";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDevelopingFlag } from "../contexts/DevelopingFlag";

import {
  openai,
  invokeDeepSeekQuizGenerator,
  invokeDeepSeekSummaryGenerator,
} from "../services/deepSeek";

export default function AIQuizNotes() {
  // ! holy this is sick
  const { state } = useLocation();
  const [response, setResponse] = useState(null);
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("quiz");

  const [isEditing, setIsEditing] = useState(false);

  const [originalText, setOriginalText] = useState(); 
  const [markdownText, setMarkdownText] = useState(); 

  // ! this allows us not to exhausted the API calls
  const { isDeveloping } = useDevelopingFlag();



  // ! function to check if the originalText (summary) has changed
  function checkIfSummaryChanged() {
    return markdownText !== originalText;
  }

  useEffect(() => {
    const generateQuiz = async () => {
      console.log("Generating content...");
      console.log(state);
      console.log(state.transcript);
      
      if (!state?.transcript) return;

      try {
        let quizResponse;

        if (!isDeveloping && openai) {
          // checking if OpenAI client is available
          const quizRaw = await invokeDeepSeekQuizGenerator(
            state.transcript,
            state.model,
            state.difficulty,
            state.numQuestions
          );

          // Clean and parse responses
          quizResponse = JSON.parse(quizRaw.replace(/```json|```/g, "").trim());

          console.log('check me out here START QUIZ OPENAI');
          console.log('quizRaw', quizRaw);
          console.log('quizResponse', quizResponse);
          console.log('quizResponse.quiz', quizResponse.quiz);
          console.log('quizResponse', JSON.stringify(quizResponse, null, 2));
          console.log('check me out here END QUIZ OPENAI');

        } else {
          // Use placeholder data for development
          quizResponse = {
            quiz: [
              {
                "question": "What does EBS stand for in AWS?",
                "options": [
                  "Elastic Block System",
                  "Elastic Block Store",
                  "Elastic Backup Storage",
                  "Extended Block Service"
                ],
                "correct": 1,
                "explanation": "EBS stands for Elastic Block Store, which is a network drive that can be attached to EC2 instances while they run."
              },
              {
                "question": "What is the primary purpose of an EBS Volume?",
                "options": [
                  "To provide temporary storage for EC2 instances",
                  "To persist data even after the instance is terminated",
                  "To act as a physical drive for EC2 instances",
                  "To replace S3 storage for large datasets"
                ],
                "correct": 1,
                "explanation": "EBS Volumes allow data to persist even after the instance is terminated, enabling data recovery by attaching the volume to a new instance."
              },
              {
                "question": "How many instances can an EBS Volume be attached to at the CCP level?",
                "options": [
                  "Unlimited",
                  "Two",
                  "One",
                  "Depends on the volume size"
                ],
                "correct": 2,
                "explanation": "At the Certified Cloud Practitioner (CCP) level, an EBS Volume can only be attached to one instance at a time."
              },
              {
                "question": "What is the availability zone constraint for EBS Volumes?",
                "options": [
                  "They can be moved freely across regions",
                  "They are bound to a specific availability zone",
                  "They are global and can be accessed from any AZ",
                  "They can be attached to instances in multiple AZs simultaneously"
                ],
                "correct": 1,
                "explanation": "EBS Volumes are locked to a specific availability zone and cannot be directly attached to instances in another AZ without a snapshot."
              },
              {
                "question": "What is the default behavior of the 'Delete on Termination' attribute for the root EBS Volume?",
                "options": [
                  "It is disabled by default",
                  "It is enabled by default",
                  "It depends on the instance type",
                  "It must be manually configured during setup"
                ],
                "correct": 1,
                "explanation": "By default, the 'Delete on Termination' attribute is enabled for the root EBS Volume, causing it to be deleted when the instance is terminated."
              },
              {
                "question": "What is the default behavior of the 'Delete on Termination' attribute for additional EBS Volumes?",
                "options": [
                  "It is enabled by default",
                  "It is disabled by default",
                  "It depends on the volume type",
                  "It is randomly assigned"
                ],
                "correct": 1,
                "explanation": "For any additional EBS Volumes attached to an instance, the 'Delete on Termination' attribute is disabled by default."
              },
              {
                "question": "How can you move an EBS Volume to a different availability zone?",
                "options": [
                  "By directly attaching it to an instance in another AZ",
                  "By creating a snapshot and restoring it in another AZ",
                  "By using AWS DataSync",
                  "By increasing the volume size"
                ],
                "correct": 1,
                "explanation": "To move an EBS Volume to another AZ, you must create a snapshot of the volume and then restore it in the desired AZ."
              },
              {
                "question": "What is the free tier offering for EBS storage per month?",
                "options": [
                  "50 GB of any EBS type",
                  "30 GB of General Purpose (SSD) or Magnetic storage",
                  "100 GB of GP3 storage",
                  "10 GB of IO1 storage"
                ],
                "correct": 1,
                "explanation": "AWS provides 30 GBs of free EBS storage per month for General Purpose (SSD) or Magnetic volumes."
              },
              {
                "question": "What analogy is used to describe EBS Volumes in the transcript?",
                "options": [
                  "Network USB sticks",
                  "Cloud hard drives",
                  "Virtual RAM disks",
                  "Temporary cache storage"
                ],
                "correct": 0,
                "explanation": "EBS Volumes are compared to network USB sticks because they can be detached from one instance and attached to another via the network."
              },
              {
                "question": "What must you provision in advance when creating an EBS Volume?",
                "options": [
                  "The number of instances it can be attached to",
                  "The availability zone",
                  "The capacity (GB) and IOPS",
                  "The snapshot schedule"
                ],
                "correct": 2,
                "explanation": "When creating an EBS Volume, you must specify the capacity (in GB) and the IOPS (I/O operations per second) in advance."
              },
              {
                "question": "What happens to an unattached EBS Volume?",
                "options": [
                  "It is automatically deleted after 30 days",
                  "It remains available until manually deleted",
                  "It is moved to S3 for cost savings",
                  "It can only exist for 7 days"
                ],
                "correct": 1,
                "explanation": "Unattached EBS Volumes persist until manually deleted, and you are billed for their provisioned capacity."
              },
              {
                "question": "Which of the following is a use case for disabling 'Delete on Termination' for the root volume?",
                "options": [
                  "To reduce costs",
                  "To preserve data when the instance is terminated",
                  "To enable multi-AZ attachment",
                  "To increase IOPS performance"
                ],
                "correct": 1,
                "explanation": "Disabling 'Delete on Termination' for the root volume allows you to preserve data even when the instance is terminated."
              },
              {
                "question": "What type of EBS Volumes are primarily discussed in the transcript?",
                "options": [
                  "IO1 and IO2",
                  "GP2 and GP3",
                  "ST1 and SC1",
                  "Magnetic only"
                ],
                "correct": 1,
                "explanation": "The transcript mentions GP2 and GP3 as the EBS Volume types used in the course."
              },
              {
                "question": "Why might there be latency when using EBS Volumes?",
                "options": [
                  "Because they are physical drives",
                  "Because they use the network for communication",
                  "Because they are encrypted by default",
                  "Because they are shared across multiple instances"
                ],
                "correct": 1,
                "explanation": "EBS Volumes are network drives, so communication between the instance and the volume introduces some latency."
              },
              {
                "question": "What is a key advantage of EBS Volumes in failover scenarios?",
                "options": [
                  "They automatically replicate across AZs",
                  "They can be quickly detached and attached to another instance",
                  "They are free during failover events",
                  "They require no configuration"
                ],
                "correct": 1,
                "explanation": "EBS Volumes can be detached from one instance and attached to another quickly, making them useful for failover scenarios."
              },
            ],
          };
        }

        if (!openai) {
          toast.warn(
            "OpenAI client is not available. Demo data is being used.",
            {
              position: "top-center",
              autoClose: 2500, 
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
        }

        setResponse(quizResponse.quiz.map(shuffleQuestionOptions));
        console.log('NEED TO KNOW HOW THIS WORKS -> quizResponse.quiz', quizResponse.quiz);
      } catch (error) {
        console.error("Generation error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (state.mode === 'generate') {
      generateQuiz();
    }
  }, [state, isDeveloping]);

  useEffect(() => {
    const generateSummary = async () => {
      console.log("Generating content...");
      console.log(state);
      console.log(state.transcript);
      
      if (!state?.transcript) return;

      try {
        let summaryResponse;

        if (!isDeveloping && openai) {
          const summaryRaw = await invokeDeepSeekSummaryGenerator(
            state.transcript,
            state.model
          );

          summaryResponse = summaryRaw.replace(/```html|```/g, "").trim();

          console.log('check me out here START SUMMARY OPENAI');
          console.log('summaryRaw', JSON.stringify(summaryRaw, null, 2));
          console.log('summaryResponse', JSON.stringify(summaryResponse, null, 2));
          console.log('check me out here END SUMMARY OPENAI');

        } else {
          // Use placeholder data for development

          summaryResponse = `### Notes on Stephan Mareek's AWS AI Practitioner Exam Course - Section 1: Introduction to Cloud Computing

---

#### **1. Basics of How Websites Work**
- **Client-Server Model**:
  - A **client** (e.g., web browser) sends a request to a **server** over a network.
  - The server processes the request and sends a response back to the client.
  - **IP Addresses** are used to identify clients and servers, similar to addresses on letters.

- **Analogy**:
  - Sending a letter: 
    - Client = You writing the letter.
    - Network = Post office routing the letter.
    - Server = Recipient who replies using your return address.

---

#### **2. Components of a Server**
A server is like a "brain" for computing tasks. It consists of:
1. **CPU (Central Processing Unit)**:
   - Performs computations and calculations.
2. **RAM (Random Access Memory)**:
   - Fast, temporary memory for quick data access.
3. **Storage**:
   - Long-term storage for files and data.
   - **Databases**: Structured storage for easy querying and searching.
4. **Networking**:
   - Routers, switches, and DNS servers to manage data flow.

---

#### **3. Networking Basics**
- **Network**: A system of cables, routers, and servers connected to each other.
- **Router**: Forwards data packets between networks (like a post delivery service).
- **Switch**: Directs data packets to the correct client within a network.

---

#### **4. Traditional IT Infrastructure**
- **Early Days**:
  - Companies started with servers in homes or garages (e.g., Google).
  - As demand grew, more servers were added, leading to the need for dedicated spaces.
- **Data Centers**:
  - Dedicated rooms or facilities filled with servers.
  - Companies scaled by adding more servers.

- **Challenges with Traditional IT**:
  1. **Costs**:
     - Rent, power supply, cooling, and maintenance.
  2. **Scalability**:
     - Limited by physical space and time to set up new servers.
  3. **Disaster Risks**:
     - Earthquakes, power outages, or fires could disrupt operations.
  4. **24/7 Monitoring**:
     - Requires a dedicated team to manage infrastructure.

---

#### **5. Introduction to the Cloud**
- **Cloud Computing**:
  - Solves the challenges of traditional IT by externalizing infrastructure.
  - Provides **on-demand** access to compute, memory, storage, and networking resources.
  - Eliminates the need for physical servers, data centers, and manual maintenance.

---

#### **Real-World Applications and Use Cases**
1. **Startups**:
   - Start small without investing in physical servers.
   - Scale quickly as the business grows.
2. **E-commerce**:
   - Handle traffic spikes during sales or promotions.
3. **Disaster Recovery**:
   - Cloud providers offer redundancy and backup solutions.
4. **AI and Machine Learning**:
   - Access powerful computing resources for training models without owning hardware.

---

#### **Key Takeaways**
- **Cloud Computing** is a game-changer for businesses, offering scalability, cost-efficiency, and reliability.
- Traditional IT infrastructure is limited by physical constraints, while the cloud provides flexibility and on-demand resources.
- Understanding the basics of servers, networking, and data centers is crucial for grasping cloud concepts.


| Concept                | Explanation |
|------------------------|------------|
| **Cloud Computing**    | Provides scalability, cost-efficiency, and reliability for businesses. |
| **Traditional IT**     | Limited by physical constraints, unlike the cloud which offers flexibility. |
| **On-Demand Resources** | The cloud allows businesses to scale resources as needed, reducing waste. |
| **Networking & Servers** | Understanding these fundamentals is key to grasping cloud concepts. |

#### **Next Steps**
- In the next lecture, we’ll dive deeper into **what the cloud is** and how it works.

These notes should help you follow along with Stephan Mareek's video and prepare effectively for the AWS AI Practitioner Exam!`;
        }

        if (!openai) {
          toast.warn(
            "OpenAI client is not available. Demo data is being used.",
            {
              position: "top-center",
              autoClose: 2500, 
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
        }

        setSummary(summaryResponse);
        setOriginalText(summaryResponse); // setting the original text to the summary response
        setMarkdownText(summaryResponse); // making the summary editable

      } catch (error) {
        console.error("Generation error:", error);
      }
    };

    if (state.mode === 'generate') {
      generateSummary();
    }
  }, [state, isDeveloping]);

  useEffect(() => {
    const loadData = async () => {
      console.log("Loading data...");
      console.log(state);
      
      if (!state?.quizFetch || !state?.summaryFetch) return;

      try {
        let quizLoad;
        let summaryLoad;

        quizLoad = state.quizFetch
        console.log('INSIDE loadData | quizLoad', JSON.stringify(quizLoad, null, 2));
        summaryLoad = state.summaryFetch
        console.log('INSIDE loadData | summaryLoad', JSON.stringify(summaryLoad, null, 2));

        // TOOD: need to handle error requests in here maybe or in the quizDetail page


        setResponse(quizLoad.quiz.map(shuffleQuestionOptions));
        setSummary(summaryLoad);
        setOriginalText(summaryLoad); // setting the original text to the summary response
        setMarkdownText(summaryLoad); // making the summary editable

      } catch (error) {
        console.error("Loading error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (state.mode === 'load') {
      console.log('INSIDE loadData | state', JSON.stringify(state, null, 2));
      loadData();
    }
  }, [state]);

  if (!state?.transcript && !state?.summaryFetch && !state?.quizFetch) {
    return <div>No transcript or summary or quiz provided. Please go back and enter one.</div>;
  }

  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

  const startTimeRef = useRef(null); // Declare once, at the top level

  useEffect(() => {
    if (isLoading) {
      startTimeRef.current = Date.now();
      console.log('start load cache | just checking how long it takes to load responses');
  
      const timer = setTimeout(() => {
        setShowTimeoutMessage(true);
      }, 20000); // 20 seconds
  
      return () => clearTimeout(timer);
    } else {
      setShowTimeoutMessage(false);
  
      if (startTimeRef.current) {
        const duration = (Date.now() - startTimeRef.current) / 1000;
        console.log('cache load ok executed in', duration.toFixed(2), 'seconds');
      }
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-white space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p>Generating your quiz...</p>
        {showTimeoutMessage && (
          <p className="text-blue-300 text-sm mt-4 max-w-md text-center">
            Thank you for your patience! This is taking longer than usual. We're still working on creating the best quiz for you.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="shadow-sm z-50">
        <div className="tab-buttons-container">
          <div className="tab-buttons-inner max-[920px]:!left-0 max-[920px]:!justify-center">
            <button
              className={`tab-button ${activeTab === "quiz" ? "active" : ""}`}
              onClick={() => setActiveTab("quiz")}
            >
              Quiz
            </button>
            <button
              className={`tab-button ${
                activeTab === "summary" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("summary");
                // TODO: need to add a confirm dialog to warn the user that they will lose their changes if they are not saved
                setIsEditing(false);
              }}
            >
              Study Notes
            </button>
          </div>
        </div>
      </div>

      {activeTab === "quiz" ? (
        <div className="tab-content">
          <QuizSection response={response} />
        </div>
      ) : (
        
        <div className="mt-4 max-w-3xl mx-auto p-6 shadow-lg rounded-lg">
  <div className="flex justify-end mb-2">
  {checkIfSummaryChanged() && isEditing && (
    <button
      onClick={() => setMarkdownText(originalText)}
      className="text-sm px-3 py-1 bg-blue-500 mr-2 text-white rounded hover:bg-blue-600"
    >
      Revert to Original
    </button>
  )}
    <button
      onClick={() => setIsEditing(!isEditing)}
      className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      {isEditing ? "Preview Notes" : "Edit Notes"}
    </button>
  </div>

  {isEditing ? (
    <textarea
      value={markdownText}
      // TODO: Might NOT WANT to allow more than 1000 characters as will blow up how much can be saved per User 
      onChange={(e) => setMarkdownText(e.target.value)}
      className="w-full h-130 p-4 text-sm bg-gray-800 text-gray-100 border border-gray-600 rounded"
    />
  ) : (
    <div className="prose prose-lg prose-blue max-w-full text-gray-200 leading-relaxed space-y-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-2">{children}</ol>,
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-700">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-700 px-4 py-2 bg-gray-800 text-gray-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-700 px-4 py-2 text-gray-200">
              {children}
            </td>
          ),
        }}
      >
        {markdownText}
      </ReactMarkdown>
    </div>
  )}
</div>
      )}
    </div>
  );
}
