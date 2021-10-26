import { useState, useEffect } from 'react';
import { Tracker } from 'meteor/tracker';

export default function useTracker(trackerFun, deps = []) {
  const [res, setRes] = useState(trackerFun());
  const [comp, setComp] = useState(null);
  const stopComp = () => {
    comp && comp.stop();
    setComp(null);
  };

  useEffect(() => {
    stopComp();
    Tracker.autorun((currentComp) => {
      setComp(currentComp);
      setRes(trackerFun());
    });
    return stopComp;
  }, deps);

  return res;
}
