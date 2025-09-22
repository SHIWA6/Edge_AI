
import React , {useState, useRef, useEffect} from 'react';0
import { FaMicrophoneAlt, FaBroadcastTower} from 'react-icons/fa'
import { gsap } from 'gsap'


const VoiceButton = ({onClick , isRecording})=> {
    
    const buttonRef = useRef(null);
    const wavesref = useRef (null);
    const pulseRef = useRef(null);


   
  useEffect(() => {
    const timeline = gsap.timeline()
    console.log('isRecording:', isRecording)
    
    if (isRecording) {
      if (buttonRef.current && wavesref.current && pulseRef.current) {
        timeline
          .to(buttonRef.current, {
            boxShadow: '0 0 30px 8px #ff3c3c, 0 0 60px 15px rgba(255, 60, 60, 0.3)',
            background: 'radial-gradient(circle at center, #ff4c4c, #b22222)',
            scale: 1.05,
            duration: 0.5,
            ease: 'power2.inOut',
          })
          .to(
            wavesref.current,
            {
              opacity: 1,
              scale: 1.6, 
              duration: 1.8,
              repeat: -1,
              ease: 'sine.inOut',
              yoyo: true,
            },
            '<'
          )
          .to(
            pulseRef.current,
            {
              opacity: 0.6,
              scale: 1.4, 
              duration: 1.2,
              repeat: -1,
              ease: 'power1.inOut',
              yoyo: true,
            },
            '<0.2'
          )
      }
    } else {
      if (buttonRef.current && wavesref.current && pulseRef.current) {
        timeline
          .to(buttonRef.current, {
            boxShadow: '0 0 20px 5px #00e0ff, 0 0 40px 10px rgba(0, 224, 255, 0.2)',
            background: 'radial-gradient(circle at center, #00b4db, #0083b0)',
            scale: 1,
            duration: 0.5,
            ease: 'power2.inOut',
          })
          .to(wavesref.current, {
            opacity: 0,
            scale: 1,
            duration: 0.5,
          })
          .to(pulseRef.current, {
            opacity: 0,
            scale: 1,
            duration: 0.5,
          }, '<')
      }
    }
  }, [isRecording])






    const containerStyle = {
        display : 'flex',
        flexDirection : 'coloumn',
        alignitems: 'center',
        justifyContent: 'center',
        gap: '15px', 
    fontFamily: '"Orbitron", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    userSelect: 'none',
    position: 'relative',
    padding: '30px 20px', 
    }
    const calloutStyle = {
        color: isRecording ? '#ff4c4c' : '#00e0ff',
    fontWeight: '700',
    fontSize: '1.2rem',
    textShadow: isRecording
      ? '0 0 12px #ff4c4c, 0 0 24px rgba(255, 60, 60, 0.5)'
      : '0 0 12px #00e0ff, 0 0 24px rgba(0, 224, 255, 0.5)',
    transition: 'all 0.1s ease',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    background: isRecording
      ? 'linear-gradient(45deg, #ff4c4c, #ff8080)'
      : 'linear-gradient(45deg, #00e0ff, #80e0ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',

    }

    const buttonStyle = {
        position: 'relative',
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '2.8rem',
    background: 'radial-gradient(circle at center, #00b4db, #0083b0)',
    boxShadow: '0 0 20px 5px #00e0ff, 0 0 40px 10px rgba(0, 224, 255, 0.2)',
    transition: 'all 0.5s ease',
    zIndex: 3,
    backdropFilter: 'blur(10px)',

    }

    const iconStyle = {
    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))',
    transition: 'all 0.3s ease',
  }
    
   const pulseStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '130px', 
    height: '130px',
    borderRadius: '50%',
    background: 'transparent',
    border: isRecording
      ? '2px solid rgba(255, 60, 60, 0.4)'
      : '2px solid rgba(0, 224, 255, 0.4)',
    transform: 'translate(-50%, -50%) scale(1)',
    opacity: 0,
    pointerEvents: 'none',
    zIndex: 0,
  }

    const wavesStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '110px', // Reduced from 120px to 110px
    height: '110px',
    borderRadius: '50%',
    background: isRecording
      ? 'radial-gradient(circle, rgba(255, 60, 60, 0.3), rgba(255, 60, 60, 0.1))'
      : 'radial-gradient(circle, rgba(0, 224, 255, 0.3), rgba(0, 224, 255, 0.1))',
    transform: 'translate(-50%, -50%) scale(1)',
    opacity: 0,
    pointerEvents: 'none',
    zIndex: 1,
    border: isRecording
      ? '1px solid rgba(255, 60, 60, 0.2)'
      : '1px solid rgba(0, 224, 255, 0.2)',
  }



    

    return (<div style={containerStyle}> 
    <div style={calloutStyle}>  </div>
    <div style={{position: 'relative'}}>
        <button onClick={onClick}
                ref={buttonRef}
                style={buttonStyle}
                aria-label='voice Input Button'
                onMouseEnter={( e)=> {
                    if(!isRecording)
                        {
                            gsap.to(e.target, {scale: 1.05, duration:0.2})
                        }
                }
            }

            onMouseLeave={(e) => {
              if(!isRecording){
                gsap.to(e.target, {scale:1, duration:0.2})
              }
            }}
        > 
        {isRecording? (<FaBroadcastTower style={iconStyle}/>) :
        (<FaMicrophoneAlt style={iconStyle}></FaMicrophoneAlt>)}
        
        </button>
            
            <div ref={wavesref} style={wavesStyle}></div>
            <div ref={pulseRef} style={pulseStyle}></div>

    </div>
    </div>)

}
export default VoiceButton;