import Login from './Login';
import supabase from '../supabaseClient';
import {useState, useEffect} from 'react';
import RivalsNav from "./RivalsNav";

export default function Auth() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({data: {session}}) => {
      setSession(session);
    });

    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);
  return <RivalsNav></RivalsNav>
}
