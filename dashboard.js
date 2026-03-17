import React, { useEffect, useState, useRef } from 'react';
import { models } from 'powerbi-client';
    
function Overview() {
  const [generatedToken, setGeneratedToken] = useState('');
  const [pageName, setPageName] = useState('8c5e9ec59a2fde450ea3');
  const [isLoading, setIsLoading] = useState(true);
  const [organisationID, setOrganisationID] = useState(localStorage.getItem("organisationID") || "DefaultUser");

  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const previousOrgIDRef = useRef(organisationID); // Track previous ID

  // Poll localStorage every 2 seconds to detect organisationID change
  useEffect(() => {
    const interval = setInterval(() => {
      const currentOrgID = localStorage.getItem("organisationID");
      if (currentOrgID && currentOrgID !== previousOrgIDRef.current) {
        previousOrgIDRef.current = currentOrgID;
        setOrganisationID(currentOrgID);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Resize Power BI container on window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && iframeRef.current) {
        const container = containerRef.current;
        const iframe = iframeRef.current;

        const width = container.clientWidth - 40;
        const height = Math.min(width * (9 / 16), window.innerHeight - 100);

        iframe.style.width = `${width}px`;
        iframe.style.height = `${height}px`;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch and embed report whenever organisationID changes
  useEffect(() => {
    if (organisationID) {
      generateEmbedToken(organisationID);
    }
  }, [organisationID]);

  const generateEmbedToken = async (orgID) => {
    setIsLoading(true);

    try {
      const response = await fetch("https://api.orgzstack.com/v1/biAuth/Payroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: orgID,
          roles: ["organization"],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const embedToken = data.token;

      setGeneratedToken(embedToken);
      embedReport(embedToken);
    } catch (error) {
      console.error("❌ Failed to generate embed token:", error);
      setIsLoading(false);
    }
  };

  const embedReport = (token) => {
    const embedConfig = {
      type: 'report',
      id: '48d99483-a059-45d4-a8fd-274be9914a94',
      embedUrl: `https://app.powerbi.com/reportEmbed?reportId=48d99483-a059-45d4-a8fd-274be9914a94&groupId=cbb1f399-3b01-4969-8753-237ad525cb3d&pageName=${pageName}`,
      accessToken: token,
      tokenType: models.TokenType.Embed,
      settings: {
        layoutType: models.LayoutType.Custom,
        filterPaneEnabled: false,
        navContentPaneEnabled: false,
      },
    };

    const reportContainer = iframeRef.current;

    if (reportContainer && window.powerbi) {
      try {
        window.powerbi.reset(reportContainer);
        window.powerbi.embed(reportContainer, embedConfig);
      } catch (error) {
        console.error('❌ Error embedding report:', error);
      } finally {
        setTimeout(() => setIsLoading(false), 2000);
      }
    } else {
      console.error('⚠️ Power BI not loaded or container not found');
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container} ref={containerRef}>
      {isLoading && (
        <div style={styles.loaderContainer}>
          <div className="loader" />
          <p>Loading report...</p>
        </div>
      )}
      <div ref={iframeRef} style={styles.reportContainer} />
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '#f9fafe',
    minHeight: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'Segoe UI, sans-serif',
    position: 'relative',
  },
  reportContainer: {
    width: '100%',
    maxWidth: '100%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  loaderContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '10px',
    zIndex: 10,
  },
};