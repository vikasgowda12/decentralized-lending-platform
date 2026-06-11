// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DecentralizedVoting {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    struct Voter {
        bool isAuthorized;
        bool hasVoted;
        uint256 votedCandidateId;
    }

    address public immutable owner;
    string public electionTitle;
    bool public electionStarted;
    uint256 public candidatesCount;

    mapping(uint256 => Candidate) public candidates;
    mapping(address => Voter) public voters;

    event CandidateRegistered(uint256 indexed candidateId, string name);
    event VoterAuthorized(address indexed voter);
    event VoteCast(address indexed voter, uint256 indexed candidateId);
    event ElectionStarted(string title);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyBeforeStart() {
        require(!electionStarted, "Election already started");
        _;
    }

    constructor(string memory _title, string[] memory _candidateNames) {
        require(_candidateNames.length > 1, "At least two candidates required");

        owner = msg.sender;
        electionTitle = _title;

        for (uint256 i = 0; i < _candidateNames.length; i++) {
            _registerCandidate(_candidateNames[i]);
        }
    }

    function registerCandidate(string memory _name) external onlyOwner onlyBeforeStart {
        _registerCandidate(_name);
    }

    function authorizeVoter(address _voter) external {
        require(_voter != address(0), "Invalid voter address");
        // Allow any account to authorize themselves, or owner to authorize others
        require(msg.sender == owner || msg.sender == _voter, "Can only authorize yourself");
        voters[_voter].isAuthorized = true;
        emit VoterAuthorized(_voter);
    }

    function startElection() external onlyOwner onlyBeforeStart {
        electionStarted = true;
        emit ElectionStarted(electionTitle);
    }

    function castVote(uint256 _candidateId) external {
        Voter storage voter = voters[msg.sender];

        require(electionStarted, "Election has not started");
        require(voter.isAuthorized, "Voter is not authorized");
        require(!voter.hasVoted, "Voter has already voted");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate");

        voter.hasVoted = true;
        voter.votedCandidateId = _candidateId;
        candidates[_candidateId].voteCount += 1;

        emit VoteCast(msg.sender, _candidateId);
    }

    function getResults() external view returns (Candidate[] memory) {
        Candidate[] memory result = new Candidate[](candidatesCount);
        for (uint256 i = 1; i <= candidatesCount; i++) {
            result[i - 1] = candidates[i];
        }
        return result;
    }

    function getVoter(address _voter) external view returns (Voter memory) {
        return voters[_voter];
    }

    function _registerCandidate(string memory _name) internal {
        require(bytes(_name).length > 0, "Candidate name is required");
        candidatesCount += 1;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        emit CandidateRegistered(candidatesCount, _name);
    }
}

