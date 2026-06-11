import { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { contractAbi } from "./contract";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "";

const initialForm = {
  name: "",
  email: "",
  nationalId: "",
  walletAddress: ""
};

export default function App() {
  const [election, setElection] = useState(null);
  const [results, setResults] = useState([]);
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState("Connect your wallet to begin.");
  const [voterState, setVoterState] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [adminWallet, setAdminWallet] = useState("");
  const [authorizeWallet, setAuthorizeWallet] = useState("");
  const [electionStarted, setElectionStarted] = useState(false);

  useEffect(() => {
    loadElection();
  }, []);

  async function loadElection() {
    try {
      const response = await fetch(`${apiUrl}/election`);
      if (!response.ok) throw new Error("Backend not reachable. Make sure the server is running on port 4000.");
      const data = await response.json();
      setElection(data);
      if (contractAddress) await loadResults();
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function getContract(readOnly = true) {
    if (!contractAddress) throw new Error("Add VITE_CONTRACT_ADDRESS in client/.env");
    if (!window.ethereum) throw new Error("MetaMask is required");
    const provider = new BrowserProvider(window.ethereum);
    const signer = readOnly ? undefined : await provider.getSigner();
    return new Contract(contractAddress, contractAbi, signer || provider);
  }

  async function connectWallet() {
    try {
      if (!window.ethereum) throw new Error("Install MetaMask to use this app");

      const [account] = await window.ethereum.request({
        method: "eth_requestAccounts"
      });

      setWallet(account);
      setFormData((current) => ({ ...current, walletAddress: account }));
      setStatus("Wallet connected.");

      if (contractAddress) {
        const contract = await getContract(true);
        const owner = await contract.owner();
        const voter = await contract.getVoter(account);
        const started = await contract.electionStarted();

        setAdminWallet(owner);
        setElectionStarted(started);
        setVoterState({
          isAuthorized: voter.isAuthorized,
          hasVoted: voter.hasVoted,
          votedCandidateId: Number(voter.votedCandidateId)
        });

        await loadResults();
      }
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function loadResults() {
    try {
      const contract = await getContract(true);
      const chainResults = await contract.getResults();
      const started = await contract.electionStarted();
      setElectionStarted(started);
      setResults(
        chainResults.map((item) => ({
          id: Number(item.id),
          name: item.name,
          voteCount: Number(item.voteCount)
        }))
      );
    } catch (error) {
      setStatus(error.message);
    }
  }

  // FIX 1: Submit Registration now shows a clear error if backend is down
  async function handleRegister(event) {
    event.preventDefault();

    if (!formData.name || !formData.email || !formData.nationalId || !formData.walletAddress) {
      setStatus("Please fill in all fields before submitting.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/voters/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) {
        setStatus(data.message || "Registration failed. Check if backend server is running.");
        return;
      }

      setStatus("Registered! You can now click 'Authorize My Wallet' below to authorize yourself on-chain.");
      setFormData((current) => ({ ...initialForm, walletAddress: current.walletAddress }));
    } catch (error) {
      // This catches network errors when backend is completely down
      setStatus("Cannot reach backend server. Run: node src/app.js in your server folder.");
    }
  }

  // FIX 2: handleAuthorize now supports both admin authorizing others AND self-authorization
  async function handleAuthorize(targetAddress) {
    try {
      if (!wallet) {
        setStatus("Connect your wallet first.");
        return;
      }

      const contract = await getContract(false);
      const addressToAuthorize = targetAddress || authorizeWallet || wallet;

      if (!addressToAuthorize) {
        setStatus("No wallet address to authorize.");
        return;
      }

      const tx = await contract.authorizeVoter(addressToAuthorize);
      setStatus("Transaction submitted, waiting for confirmation...");
      await tx.wait();

      // Try to update backend too (non-critical, won't break if it fails)
      try {
        await fetch(`${apiUrl}/voters/${addressToAuthorize}/approve`, {
          method: "PATCH"
        });
      } catch (_) {
        // backend update failed but chain is already updated, that's ok
      }

      setStatus(`Wallet ${addressToAuthorize} authorized successfully on-chain!`);
      setAuthorizeWallet("");
      await connectWallet(); // refresh voter state
    } catch (error) {
      setStatus(error.reason || error.message);
    }
  }

  async function handleStartElection() {
    try {
      const contract = await getContract(false);
      const tx = await contract.startElection();
      await tx.wait();
      setStatus("Election started successfully.");
      await loadElection();
    } catch (error) {
      setStatus(error.reason || error.message);
    }
  }

  async function handleVote(candidateId) {
    try {
      const contract = await getContract(false);
      const tx = await contract.castVote(candidateId);
      await tx.wait();
      setStatus(`Vote cast for candidate #${candidateId}.`);
      await connectWallet();
    } catch (error) {
      setStatus(error.reason || error.message);
    }
  }

  const totalVotes = results.reduce((sum, c) => sum + c.voteCount, 0);
  const isAdmin = wallet && adminWallet && wallet.toLowerCase() === adminWallet.toLowerCase();
  const candidates = results.length > 0 ? results : election?.candidates || [];

  return (
    <div className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Blockchain Project</p>
          <h1>Decentralized Voting System</h1>
          <p className="hero-copy">
            Secure voter authorization, one-wallet-one-vote enforcement, and transparent results on-chain.
          </p>
        </div>
        <button className="primary-btn" onClick={connectWallet}>
          {wallet ? "Wallet Connected" : "Connect MetaMask"}
        </button>
      </header>

      <section className="grid">
        <article className="card">
          <h2>Election Overview</h2>
          <p><strong>Title:</strong> {election?.title || "Loading..."}</p>
          <p><strong>Description:</strong> {election?.description || "Loading..."}</p>
          <p><strong>Contract:</strong> {contractAddress || "Add VITE_CONTRACT_ADDRESS in client/.env"}</p>
          <p><strong>Connected Wallet:</strong> {wallet || "Not connected"}</p>
          <p><strong>Election Started:</strong> {String(electionStarted)}</p>
          <p><strong>Authorized:</strong> {voterState ? String(voterState.isAuthorized) : "Unknown"}</p>
          <p><strong>Has Voted:</strong> {voterState ? String(voterState.hasVoted) : "Unknown"}</p>
        </article>

        <article className="card">
          <h2>Register Voter</h2>
          <form className="stack" onSubmit={handleRegister}>
            <input
              placeholder="Full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              placeholder="National ID / Student ID"
              value={formData.nationalId}
              onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
            />
            <input
              placeholder="Wallet address"
              value={formData.walletAddress}
              onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
            />
            <button className="primary-btn" type="submit">Submit Registration</button>
          </form>

          {/* FIX 2: Self-authorize button — visible after wallet is connected and not yet authorized */}
          {wallet && !voterState?.isAuthorized && (
            <div style={{ marginTop: "12px" }}>
              <p style={{ fontSize: "0.85rem", marginBottom: "8px", opacity: 0.7 }}>
                After registering, authorize your wallet on-chain:
              </p>
              <button
                className="secondary-btn"
                style={{ width: "100%" }}
                onClick={() => handleAuthorize(wallet)}
                disabled={!contractAddress}
              >
                Authorize My Wallet
              </button>
            </div>
          )}

          {wallet && voterState?.isAuthorized && (
            <p style={{ marginTop: "12px", color: "green", fontWeight: "bold" }}>
              ✅ Your wallet is authorized. You can vote!
            </p>
          )}
        </article>
      </section>

      <section className="grid">
        <article className="card">
          <div className="card-heading">
            <h2>Candidates</h2>
            <span>{totalVotes} total votes</span>
          </div>
          <div className="candidate-list">
            {candidates.map((candidate) => (
              <div className="candidate-card" key={candidate.id}>
                <div>
                  <h3>{candidate.name}</h3>
                  {candidate.agenda ? <p>{candidate.agenda}</p> : null}
                </div>
                <div className="candidate-actions">
                  <span className="vote-pill">{candidate.voteCount || 0} votes</span>
                  <button
                    className="secondary-btn"
                    onClick={() => handleVote(candidate.id)}
                    disabled={!wallet || !contractAddress || !electionStarted || !voterState?.isAuthorized || voterState?.hasVoted}
                  >
                    Vote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <h2>Admin Controls</h2>
          <p><strong>Owner Wallet:</strong> {adminWallet || "Connect after deploy"}</p>

          {isAdmin ? (
            <>
              <input
                placeholder="Wallet to authorize"
                value={authorizeWallet}
                onChange={(e) => setAuthorizeWallet(e.target.value)}
              />
              <div className="button-row">
                <button
                  className="secondary-btn"
                  onClick={() => handleAuthorize(authorizeWallet)}
                  disabled={!contractAddress || !authorizeWallet}
                >
                  Authorize Voter
                </button>
                <button
                  className="primary-btn"
                  onClick={handleStartElection}
                  disabled={!contractAddress || electionStarted}
                >
                  Start Election
                </button>
              </div>
            </>
          ) : (
            <p className="hint">
              Connect with the deployer wallet (Hardhat Account #0) to use admin actions.
              <br />
              <small>Owner: {adminWallet || "unknown"}</small>
            </p>
          )}
        </article>
      </section>

      <footer className="status-bar">
        <strong>Status:</strong> {status}
      </footer>
    </div>
  );
}