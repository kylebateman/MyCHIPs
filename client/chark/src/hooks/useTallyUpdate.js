import { useEffect, useState } from 'react';

import { fetchTallies } from '../services/tally';
import { Platform } from 'react-native';

const useTallyUpdate = (wm, tally_seq, tally_ent, tallyState = undefined) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tally, setTally] = useState();
  const [tallyType, setTallyType] = useState('stock');
  const [contract, setContract] = useState('');
  const [holdTerms, setHoldTerms] = useState({
    limit: undefined,
    call: undefined,
  });
  const [partTerms, setPartTerms] = useState({
    limit: undefined,
    call: undefined,
  });
  const [comment, setComment] = useState(comment);

  useEffect(() => {
    if (wm) {
      fetchTally();
    }
  }, [wm, tally_seq, tally_ent, tallyState])

  const fetchTally = (_refreshing = false) => {
    if (_refreshing) {
      setRefreshing(true);
    }

    fetchTallies(wm, {
      fields: ['tally_seq', 'tally_uuid', 'tally_date', 'status', 'hold_terms', 'part_terms', 'part_cert', 'tally_type', 'comment', 'contract', 'json', 'hold_sig', 'hold_cert'],
      where: {
        tally_ent,
        tally_seq,
      }
    }).then(data => {
      const _tally = data?.[0];
      if (_tally) {
        setTally(_tally);
        // Stock (Partner) Foil (Start)
        console.log("TALLY ==> ", JSON.stringify(_tally));

        setTallyType(_tally.tally_type);
        setContract(_tally.contract?.source ?? '');
        setComment(_tally.comment ?? '');
        setHoldTerms({
          limit: _tally.hold_terms?.limit?.toString(),
          call: _tally.hold_terms?.call?.toString(),
        })
        setPartTerms({
          limit: _tally.part_terms?.limit?.toString(),
          call: _tally.part_terms?.call?.toString(),
        })
      }
    }).finally(() => {
      setLoading(false);
      setRefreshing(false);
    })
  }


  const onHoldTermsChange = (name) => {
    return (value) => {
      setHoldTerms({
        ...holdTerms,
        [name]: value,
      })
    }
  }

  const onPartTermsChange = (name) => {
    return (value) => {
      setPartTerms({
        ...partTerms,
        [name]: value,
      })
    }
  }

  return {
    loading,
    refreshing,
    tally,
    tallyType,
    contract,
    holdTerms,
    partTerms,
    comment,
    setComment,
    onHoldTermsChange,
    onPartTermsChange,
    setTallyType,
    setContract,
    fetchTally,
    setTally,
  }
}

export default useTallyUpdate;
