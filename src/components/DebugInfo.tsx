import { useState, useEffect } from 'react';
import { isDebugMode } from '../utils/debug';

export const DebugInfo: React.FC = () => {
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Checking...');
  const [testResult, setTestResult] = useState<string>('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('Unknown');
  const [currentVotes, setCurrentVotes] = useState<string>('');

  useEffect(() => {
    const checkSupabase = async () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const configured = supabaseUrl && supabaseKey && 
                        supabaseUrl !== 'your_supabase_project_url_here' && 
                        supabaseKey !== 'your_supabase_anon_key_here';
      
      setIsSupabaseConfigured(configured);
      
      if (configured) {
        try {
          // Test Supabase connection
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(supabaseUrl, supabaseKey);
          
                const { error } = await supabase
        .from('pokemon_votes')
        .select('*')
        .limit(1);
      
      if (error) {
        setConnectionStatus(`Error: ${error.message}`);
      } else {
        setConnectionStatus('Connected successfully');
      }
        } catch (error) {
          setConnectionStatus(`Connection failed: ${error}`);
        }
      } else {
        setConnectionStatus('Not configured - using localStorage');
      }
    };
    
    checkSupabase();
  }, []);

  const testSupabaseVote = async () => {
    if (!isSupabaseConfigured) return;
    
    try {
      setTestResult('Testing...');
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!
      );
      
      // Get all battles and show detailed info
      const { data: allData, error: selectError } = await supabase
        .from('pokemon_votes')
        .select('*')
        .order('id', { ascending: true });
      
      if (selectError) {
        setTestResult(`Select Error: ${selectError.message}`);
        return;
      }
      
      console.log('🧪 All battles in database:', allData);
      
      if (!allData || allData.length === 0) {
        setTestResult('No battles found. Creating initial Bulbasaur vs Pikachu...');
        
        const { data: insertData, error: insertError } = await supabase
          .from('pokemon_votes')
          .insert({ 
            pokemon1_id: 1,
            pokemon1_name: 'bulbasaur',
            pokemon1_votes: 0,
            pokemon2_id: 25,
            pokemon2_name: 'pikachu',
            pokemon2_votes: 0
          })
          .select()
          .single();
        
        if (insertError) {
          setTestResult(`Insert Error: ${insertError.message}`);
        } else {
          setTestResult(`Created initial battle: ${JSON.stringify(insertData)}`);
        }
      } else {
        // Show detailed battle info
        const battleInfo = allData.map(battle => 
          `ID: ${battle.id} | ${battle.pokemon1_name}(${battle.pokemon1_id}) vs ${battle.pokemon2_name}(${battle.pokemon2_id}) | Votes: ${battle.pokemon1_votes}/${battle.pokemon2_votes} | Created: ${new Date(battle.battle_started_at).toLocaleString()}`
        ).join('\n');
        
        setTestResult(`Found ${allData.length} battles:\n${battleInfo}`);
        
        // Check for duplicates
        const duplicates = allData.reduce((acc, battle) => {
          const key = `${Math.min(battle.pokemon1_id, battle.pokemon2_id)}-${Math.max(battle.pokemon1_id, battle.pokemon2_id)}`;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const duplicatePairs = Object.entries(duplicates).filter(([, count]) => (count as number) > 1);
        if (duplicatePairs.length > 0) {
          setTestResult(prev => prev + `\n\n⚠️ DUPLICATE BATTLES FOUND:\n${duplicatePairs.map(([pair, count]) => `Pair ${pair}: ${count as number} battles`).join('\n')}`);
        }
      }
    } catch (error) {
      setTestResult(`Test failed: ${error}`);
    }
  };

  const testRealTimeSubscription = async () => {
    if (!isSupabaseConfigured) return;
    
    try {
      setSubscriptionStatus('Testing subscription...');
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!
      );
      
      // Test real-time subscription
      const channel = supabase
        .channel('test_channel')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'pokemon_votes' }, 
            (payload) => {
              console.log('Test subscription received:', payload);
              setSubscriptionStatus(`Received update: ${JSON.stringify(payload)}`);
            }
        )
        .subscribe((status) => {
          console.log('Test subscription status:', status);
          setSubscriptionStatus(`Status: ${status}`);
        });
      
      // Clean up after 10 seconds
      setTimeout(() => {
        channel.unsubscribe();
        setSubscriptionStatus('Test completed');
      }, 10000);
      
    } catch (error) {
      setSubscriptionStatus(`Subscription test failed: ${error}`);
    }
  };

  const checkCurrentVotes = async () => {
    if (!isSupabaseConfigured) return;
    
    try {
      setCurrentVotes('Checking...');
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!
      );
      
      // Get all rows first to see what we have
      const { data: allData, error: selectError } = await supabase
        .from('pokemon_votes')
        .select('*');
      
      if (selectError) {
        setCurrentVotes(`Select Error: ${selectError.message}`);
        return;
      }
      
      if (!allData || allData.length === 0) {
        setCurrentVotes('No votes found');
      } else if (allData.length > 1) {
        setCurrentVotes(`Multiple rows (${allData.length}): ${JSON.stringify(allData)}`);
      } else {
        setCurrentVotes(`Current: ${JSON.stringify(allData[0])}`);
      }
    } catch (error) {
      setCurrentVotes(`Failed: ${error}`);
    }
  };

  const fixDatabase = async () => {
    if (!isSupabaseConfigured) return;
    
    try {
      setCurrentVotes('Fixing database...');
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!
      );
      
      // First, get all existing rows
      const { data: allData, error: selectError } = await supabase
        .from('pokemon_votes')
        .select('*');
      
      if (selectError) {
        setCurrentVotes(`Select Error: ${selectError.message}`);
        return;
      }
      
      if (allData && allData.length > 1) {
        // Delete all rows except the first one
        const firstRow = allData[0];
        const otherIds = allData.slice(1).map(row => row.id);
        
        if (otherIds.length > 0) {
          const { error: deleteError } = await supabase
            .from('pokemon_votes')
            .delete()
            .in('id', otherIds);
          
          if (deleteError) {
            setCurrentVotes(`Delete Error: ${deleteError.message}`);
            return;
          }
        }
        
        // Update the first row to reset votes
        const { data: updateData, error: updateError } = await supabase
          .from('pokemon_votes')
          .update({ 
            pokemon1_votes: 0, 
            pokemon2_votes: 0, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', firstRow.id)
          .select()
          .single();
        
        if (updateError) {
          setCurrentVotes(`Update Error: ${updateError.message}`);
        } else {
          setCurrentVotes(`Fixed! Reset row: ${JSON.stringify(updateData)}`);
        }
      } else if (allData && allData.length === 1) {
        // Just reset the single row
        const { data: updateData, error: updateError } = await supabase
          .from('pokemon_votes')
          .update({ 
            pokemon1_votes: 0, 
            pokemon2_votes: 0, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', allData[0].id)
          .select()
          .single();
        
        if (updateError) {
          setCurrentVotes(`Update Error: ${updateError.message}`);
        } else {
          setCurrentVotes(`Fixed! Reset row: ${JSON.stringify(updateData)}`);
        }
      } else {
        // No rows exist, create one
        const { data: insertData, error: insertError } = await supabase
          .from('pokemon_votes')
          .insert({ id: 1, pokemon1_votes: 0, pokemon2_votes: 0 })
          .select()
          .single();
        
        if (insertError) {
          setCurrentVotes(`Insert Error: ${insertError.message}`);
        } else {
          setCurrentVotes(`Fixed! Created row: ${JSON.stringify(insertData)}`);
        }
      }
    } catch (error) {
      setCurrentVotes(`Fix failed: ${error}`);
    }
  };

  if (import.meta.env.DEV) {
      // Only show debug info if debug mode is enabled
  if (!isDebugMode()) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
        <div><strong>Debug Info:</strong></div>
        <div>Supabase: {isSupabaseConfigured ? 'Configured' : 'Not configured'}</div>
        <div>Status: {connectionStatus}</div>
        <div>Env URL: {import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set'}</div>
        <div>Env Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</div>
        {isSupabaseConfigured && (
          <>
            <button 
              onClick={testSupabaseVote}
              style={{
                marginTop: '5px',
                padding: '5px 10px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                marginRight: '5px'
              }}
            >
              Test DB
            </button>
            <button 
              onClick={testRealTimeSubscription}
              style={{
                marginTop: '5px',
                padding: '5px 10px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                marginRight: '5px'
              }}
            >
              Test Real-time
            </button>
            <button 
              onClick={checkCurrentVotes}
              style={{
                marginTop: '5px',
                padding: '5px 10px',
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                marginRight: '5px'
              }}
            >
              Check Votes
            </button>
            <button 
              onClick={fixDatabase}
              style={{
                marginTop: '5px',
                padding: '5px 10px',
                background: '#ff9500',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Fix DB
            </button>
          </>
        )}
        {testResult && (
          <div style={{ marginTop: '5px', fontSize: '10px' }}>
            <strong>DB Test:</strong> {testResult}
          </div>
        )}
        {subscriptionStatus && (
          <div style={{ marginTop: '5px', fontSize: '10px' }}>
            <strong>Real-time:</strong> {subscriptionStatus}
          </div>
        )}
        {currentVotes && (
          <div style={{ marginTop: '5px', fontSize: '10px' }}>
            <strong>Votes:</strong> {currentVotes}
          </div>
        )}
      </div>
    );
  }

  return null;
}; 