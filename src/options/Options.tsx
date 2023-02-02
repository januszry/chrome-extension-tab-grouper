import { Fragment, useEffect, useState } from "react";
import styled from "styled-components";

interface OptionsStatus {
  domainGroupLevel: number,
}

const Box = styled.div`
  margin-left: 10px;
  margin-bottom: 20px;
`;

const Title = styled.h2`
`;

const GroupLevelInput = styled.input`
  margin-right: 10px;
`;

const SaveButton = styled.button`
`;

function Options() {
  const [currentOptions, setCurrentOptions] = useState<OptionsStatus>({ domainGroupLevel: 2 });
  const [savedOptions, setSavedOptions] = useState<OptionsStatus>({ domainGroupLevel: 2 });

  useEffect(() => {
    chrome.storage.sync.get({ domainGroupLevel: 3 }).then(val => {
      setCurrentOptions({ domainGroupLevel: val.domainGroupLevel });
      setSavedOptions({ domainGroupLevel: val.domainGroupLevel });
    });
  }, []);

  return (
    <Box>
      <Title>Domain group level</Title>
      <div>
        <GroupLevelInput
          type='number'
          value={currentOptions.domainGroupLevel}
          min={2}
          max={7}
          onChange={e => setCurrentOptions({ domainGroupLevel: parseInt(e.target.value) || 2 })}
        />
        <SaveButton
          disabled={currentOptions.domainGroupLevel === savedOptions.domainGroupLevel}
          onClick={async () => {
            await chrome.storage.sync.set({ ...currentOptions });
            setSavedOptions({ ...currentOptions });
          }}
        >
          Save
        </SaveButton>
      </div>
    </Box>
  );
}

export default Options;
