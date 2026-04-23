/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useSearchParams, useLocation } from 'react-router-dom';
import { Shield, AlertTriangle, Database, Search, Layout, Info, ArrowRight, Code, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Components ---

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Overview', icon: Info },
    { path: '/stored', label: 'Stored XSS', icon: Database },
    { path: '/reflected', label: 'Reflected XSS', icon: Search },
    { path: '/dom', label: 'DOM-based XSS', icon: Layout },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 h-screen sticky top-0 p-6 flex flex-col border-r border-slate-800">
      <div className="flex items-center gap-3 mb-10 text-white">
        <Shield className="text-red-500 w-8 h-8" />
        <h1 className="font-bold text-xl tracking-tight">XSS Lab</h1>
      </div>
      
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-red-500/10 text-red-500 font-medium border border-red-500/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-slate-800 text-xs text-slate-500">
        <p>Educational Tool</p>
        <p className="mt-1">© 2026 XSS Security Lab</p>
      </div>
    </div>
  );
};

const VulnerabilityHeader = ({ title, type, description }: { title: string, type: string, description: string }) => (
  <div className="mb-8">
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
      <AlertTriangle size={12} />
      {type}
    </div>
    <h2 className="text-3xl font-bold text-slate-900 mb-2">{title}</h2>
    <p className="text-slate-600 max-w-3xl text-lg">{description}</p>
  </div>
);

const ExplanationBox = ({ children, title }: { children: React.ReactNode, title: string }) => (
  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mt-8">
    <div className="flex items-center gap-2 mb-4 text-slate-900 font-semibold">
      <Code size={18} className="text-slate-500" />
      {title}
    </div>
    <div className="text-slate-600 space-y-4 text-sm leading-relaxed">
      {children}
    </div>
  </div>
);

// --- Pages ---

const Overview = () => (
  <div className="max-w-4xl">
    <h2 className="text-4xl font-bold text-slate-900 mb-6">Introduction to Cross-Site Scripting (XSS)</h2>
    <p className="text-slate-600 text-xl mb-10 leading-relaxed">
      XSS is a security vulnerability where an attacker injects malicious scripts into content from otherwise trusted websites. 
      It occurs when a web application uses unvalidated or unencoded user input within the output it generates.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {[
        { 
          title: 'Stored', 
          desc: 'The malicious script is permanently stored on the server (e.g., in a database).',
          icon: Database,
          color: 'bg-blue-50 text-blue-600'
        },
        { 
          title: 'Reflected', 
          desc: 'The script is reflected off the web application to the user browser via a link.',
          icon: Search,
          color: 'bg-purple-50 text-purple-600'
        },
        { 
          title: 'DOM-based', 
          desc: 'The vulnerability exists entirely in client-side code modifying the DOM environment.',
          icon: Layout,
          color: 'bg-emerald-50 text-emerald-600'
        }
      ].map((item) => (
        <div key={item.title} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className={`${item.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
            <item.icon size={24} />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">{item.title} XSS</h3>
          <p className="text-slate-500 text-sm">{item.desc}</p>
        </div>
      ))}
    </div>

    <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
      <div className="relative z-10">
        <h3 className="text-2xl font-bold mb-4">Try the Payload</h3>
        <p className="text-slate-400 mb-6">Use this classic alert script to test these vulnerabilities:</p>
        <code className="bg-slate-800 px-4 py-3 rounded-lg block font-mono text-pink-400 border border-slate-700">
          &lt;script&gt;alert('XSS Hack!')&lt;/script&gt;
        </code>
        <p className="mt-4 text-xs text-slate-500 italic">* Note: React usually protects against this, but in this lab we use dangerouslySetInnerHTML to demonstrate the risk.</p>
      </div>
      <div className="absolute -right-10 -bottom-10 opacity-10 blur-2xl flex">
        <Lock size={200} />
      </div>
    </div>
  </div>
);

const StoredXSS = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [author, setAuthor] = useState('');

  const fetchMessages = async () => {
    const res = await fetch('/api/messages');
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newMsg, author: author || 'Anonymous' }),
    });
    setNewMsg('');
    setAuthor('');
    fetchMessages();
  };

  return (
    <div>
      <VulnerabilityHeader 
        title="Stored XSS (Persistent)"
        type="Critical"
        description="Stored XSS occurs when a web application receives data from a user and stores it in a database without proper sanitization. The malicious content is later retrieved and rendered in another user's browser."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Database size={18} className="text-blue-500" />
              Public Guestbook
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input 
                  type="text" 
                  value={author} 
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea 
                  value={newMsg} 
                  onChange={(e) => setNewMsg(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Share your thoughts... (Try script tags!)"
                />
              </div>
              <button className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2">
                Post Message
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="space-y-4 border-t border-slate-100 pt-6">
              <h4 className="text-sm font-bold text-slate-500 uppercase">Recent Posts</h4>
              <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id} 
                    className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="font-bold text-slate-900 text-sm mb-1">{msg.author}</div>
                    {/* VULNERABLE RENDER: Using dangerouslySetInnerHTML */}
                    <div 
                      className="text-slate-600 text-sm message-content" 
                      dangerouslySetInnerHTML={{ __html: msg.text }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <ExplanationBox title="Why is this vulnerable?">
          <p>
            The backend stores the <code>text</code> parameter exactly as it is received. 
            When the client fetches the list of messages, the frontend uses <code>dangerouslySetInnerHTML</code> to render the content.
          </p>
          <p>
            <strong>The Attack:</strong> An attacker posts a message containing <code>&lt;img src=x onerror=alert(1)&gt;</code>. 
            Every user who views the guestbook will execute the script in their browser.
          </p>
          <p className="font-bold text-green-600 mt-2">The Fix:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Always sanitize input on the server using libraries like <code>DOMPurify</code>.</li>
            <li>Use safe rendering methods (Standard React JSX escaping) instead of <code>dangerouslySetInnerHTML</code>.</li>
            <li>Implement a Content Security Policy (CSP).</li>
          </ul>
        </ExplanationBox>
      </div>
    </div>
  );
};

const ReflectedXSS = () => {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const query = searchParams.get('q');

  useEffect(() => {
    if (query) {
      const fetchResult = async () => {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResult(data.query);
      };
      fetchResult();
    }
  }, [query]);

  return (
    <div>
      <VulnerabilityHeader 
        title="Reflected XSS (Non-Persistent)"
        type="Medium"
        description="Reflected XSS happens when user-provided data is immediately reflected back to the user without being stored. The attack is usually delivered via a specially crafted URL."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Search size={18} className="text-purple-500" />
              Resource Search
            </h3>
            
            <form action="/reflected" method="GET" className="flex gap-2 mb-8">
              <input 
                name="q"
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Search resources..."
              />
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Search
              </button>
            </form>

            <AnimatePresence>
              {query && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 bg-purple-50 rounded-xl border border-purple-100"
                >
                  <p className="text-slate-500 mb-2">Showing results for:</p>
                  {/* VULNERABLE RENDER: Echoing search term unsafely */}
                  <div 
                    className="text-xl font-bold text-slate-900 break-all" 
                    dangerouslySetInnerHTML={{ __html: result || query }}
                  />
                  <div className="mt-4 pt-4 border-t border-purple-100 text-slate-400 italic text-sm text-center">
                    No results found for this query.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <ExplanationBox title="Understanding the Reflection">
          <p>
            In this demo, the search term is sent to the server and echoed back. 
            The vulnerability lies in how the frontend displays the result.
          </p>
          <p>
            <strong>The Attack:</strong> An attacker sends a link like: 
            <br />
            <span className="text-xs break-all bg-slate-200 p-1 rounded font-mono">
              /reflected?q=%3Csvg%20onload%3Dalert(%27Reflected%20XSS!%27)%3E
            </span>
          </p>
          <p>
            When a victim clicks this link, the script executes immediately because the application trusts the URL parameter and renders it as HTML.
          </p>
          <p className="font-bold text-green-600 mt-2">The Fix:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Encode all dynamic content on the server or client before rendering.</li>
            <li>Use <code>textContent</code> or React's standard <code>&#123;query&#125;</code> instead of innerHTML.</li>
            <li>Validate parameters against a whitelist of characters.</li>
          </ul>
        </ExplanationBox>
      </div>
    </div>
  );
};

const DOMXSS = () => {
  const location = useLocation();
  const dashRef = useRef<HTMLDivElement>(null);
  const [userName, setUserName] = useState('Guest');

  useEffect(() => {
    // DOM-based vulnerability: Directly reading from hash and updating DOM
    const hash = window.location.hash;
    if (hash) {
      const nameMatch = hash.match(/name=([^&]*)/);
      if (nameMatch && nameMatch[1]) {
        const decodedName = decodeURIComponent(nameMatch[1]);
        setUserName(decodedName);
        
        // Simulating direct DOM manipulation that skips React's protection
        if (dashRef.current) {
          const welcomeEl = dashRef.current.querySelector('#welcome-message');
          if (welcomeEl) {
            // VULNERABLE: Using innerHTML on data from the hash
            welcomeEl.innerHTML = `Welcome back, <span class="text-emerald-600 font-bold">${decodedName}</span>!`;
          }
        }
      }
    }
  }, [location]);

  const updateHash = (name: string) => {
    window.location.hash = `name=${encodeURIComponent(name)}`;
  };

  return (
    <div>
      <VulnerabilityHeader 
        title="DOM-based XSS"
        type="Moderate"
        description="DOM XSS occurs when an application contains some client-side JavaScript that processes data from an untrusted source in an unsafe way, usually by writing the data to a dangerous sink within the DOM."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div ref={dashRef} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Layout size={18} className="text-emerald-500" />
              Dynamic User Dashboard
            </h3>
            
            <div className="mb-10 p-10 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
              {/* This element is updated via direct DOM manipulation in useEffect */}
              <div id="welcome-message" className="text-2xl font-light text-slate-800">
                Welcome back, <span className="font-bold text-emerald-600">{userName}</span>!
              </div>
              <p className="text-slate-500 mt-2 text-sm">Your settings have been saved.</p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-700">Update Profile Name:</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  onChange={(e) => updateHash(e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Enter new name..."
                />
                <div className="text-xs text-slate-400 mt-2">Updates URL Hash automatically</div>
              </div>
            </div>
          </div>
        </div>

        <ExplanationBox title="The Client-Side Sink">
          <p>
            Unlike Stored or Reflected XSS, DOM-based XSS often never touches the server. 
            The vulnerability exists entirely in the <code>useEffect</code> hook of this component.
          </p>
          <p>
            <strong>The Sink:</strong> The code reads from <code>window.location.hash</code> and uses <code>.innerHTML</code> to update the <code>#welcome-message</code> element.
          </p>
          <p>
            <strong>The Attack:</strong> An attacker sends the link: 
            <br />
            <span className="text-xs break-all bg-slate-200 p-1 rounded font-mono">
              /dom#name=&lt;img src=1 onerror=alert('DOM_XSS')&gt;
            </span>
          </p>
          <p className="font-bold text-green-600 mt-2">The Fix:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Avoid using sinks like <code>innerHTML</code>, <code>document.write</code>, or <code>eval()</code>.</li>
            <li>Use <code>innerText</code> or <code>textContent</code> to modify the DOM.</li>
            <li>Always let React handle state and DOM updates safely instead of direct manipulation.</li>
          </ul>
        </ExplanationBox>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-red-200">
        <Sidebar />
        
        <main className="flex-1 p-12 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/stored" element={<StoredXSS />} />
              <Route path="/reflected" element={<ReflectedXSS />} />
              <Route path="/dom" element={<DOMXSS />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
