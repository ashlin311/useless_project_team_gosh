import React, { useState } from 'react';
import './ActorSelection.css';

// Import actor images
import mohanlalImg from '../images/mohanlal.webp';
import fafaImg from '../images/fafa.jpg';
import prithiviImg from '../images/prithivi.jpg';
import sureshImg from '../images/suresh.jpeg';
import surajImg from '../images/suraj.jpg';

const ActorSelection = ({ onActorSelect }) => {
  const [selectedActor, setSelectedActor] = useState(null);

  const actors = [
    {
      id: 'mohanlal',
      name: 'Mohanlal',
      image: mohanlalImg,
      placeholder: '🎭'
    },
    {
      id: 'prithviraj',
      name: 'Prithviraj',
      image: prithiviImg,
      placeholder: '⭐'
    },
    {
      id: 'fahadh',
      name: 'Fahadh Faasil',
      image: fafaImg,
      placeholder: '🎪'
    },
    {
      id: 'suraj',
      name: 'Suraj Venjaramoodu',
      image: surajImg,
      placeholder: '😄'
    },
    {
      id: 'suresh',
      name: 'Suresh Gopi',
      image: sureshImg,
      placeholder: '🔥'
    }
  ];

  const handleActorClick = (actor) => {
    setSelectedActor(actor);
  };

  const handleProceed = () => {
    if (selectedActor && onActorSelect) {
      onActorSelect(selectedActor);
    }
  };

  return (
    <div className="actor-selection">
      <div className="selection-header">
        <h1 className="selection-title">Choose Your Roaster</h1>
        <p className="selection-subtitle">
          Pick a Malayalam legend to roast your music taste! 🎭
        </p>
      </div>

      <div className="actors-ring">
        <div className="ring-container">
          {actors.map((actor, index) => (
            <div
              key={actor.id}
              className={`actor-circle ${selectedActor?.id === actor.id ? 'selected' : ''}`}
              style={{
                '--index': index,
                '--total': actors.length
              }}
              onClick={() => handleActorClick(actor)}
            >
              <div className="actor-image-container">
                <img src={actor.image} alt={actor.name} className="actor-image" />
              </div>
              <div className="actor-name">{actor.name}</div>
            </div>
          ))}
        </div>

        {/* Center content */}
        <div className="ring-center">
          <div className="center-content">
            {selectedActor ? (
              <>
                <h3 className="selected-actor-name">{selectedActor.name}</h3>
                <p className="selected-actor-text">Ready to roast your music taste!</p>
                <button className="proceed-btn" onClick={handleProceed}>
                  <span className="btn-icon">🔥</span>
                  Start Roasting Session
                </button>
              </>
            ) : (
              <>
                <h3 className="center-title">Select an Actor</h3>
                <p className="center-text">Click on any actor to choose your roaster</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="selection-footer">
        <div className="actor-descriptions">
          <div className="description-grid">
            <div className="actor-desc">
              <strong>Mohanlal:</strong> The Complete Actor - Expect witty, intellectual roasts
            </div>
            <div className="actor-desc">
              <strong>Prithviraj:</strong> The Young Superstar - Modern, savage comebacks
            </div>
            <div className="actor-desc">
              <strong>Fahadh Faasil:</strong> The Method Actor - Quirky, unexpected observations
            </div>
            <div className="actor-desc">
              <strong>Suraj:</strong> The Comedy King - Hilarious, light-hearted roasts
            </div>
            <div className="actor-desc">
              <strong>Suresh Gopi:</strong> The Action Hero - Intense, dramatic reactions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActorSelection;
