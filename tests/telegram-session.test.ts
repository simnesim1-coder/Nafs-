import {it,expect,vi,beforeEach,afterEach} from 'vitest';
const mocks=vi.hoisted(()=>({get:vi.fn(),delete:vi.fn(),set:vi.fn(),from:vi.fn(),emailUser:vi.fn()}));
vi.mock('next/headers',()=>({cookies:async()=>({get:mocks.get,delete:mocks.delete,set:mocks.set,getAll:()=>[]})}));
vi.mock('@supabase/ssr',()=>({createServerClient:()=>({auth:{getUser:mocks.emailUser}})}));
vi.mock('@supabase/supabase-js',()=>({createClient:()=>({from:mocks.from})}));
import {requireUser,clearTelegramSession} from '../lib/server';
import {hashSession} from '../lib/telegram/validation';
const token='a'.repeat(43),owner='11111111-1111-4111-8111-111111111111';
function result(expiry:string){mocks.from.mockImplementation(table=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:{user_id:owner,expires_at:expiry},error:null}),single:async()=>({data:table==='telegram_identities'?{display_name:'Verified name'}:null,error:null})})}),delete:()=>({eq:async()=>({error:null})})}))}
beforeEach(()=>{vi.clearAllMocks();vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://example.invalid');vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY','test-only');vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','test-only');mocks.get.mockReturnValue({value:token});mocks.emailUser.mockResolvedValue({data:{user:{id:'email-owner',email:'email@example.invalid'}},error:null});result(new Date(Date.now()+60000).toISOString())});
afterEach(()=>vi.unstubAllEnvs());
it('resolves a Telegram session only to its server-side owner and bypasses email identity',async()=>{const auth=await requireUser();expect(auth.user.id).toBe(owner);expect(auth.user.email).toBe('Verified name');expect(auth.provider).toBe('telegram');expect(mocks.emailUser).not.toHaveBeenCalled()});
it('rejects expired or malformed sessions rather than silently falling through to a different account',async()=>{result(new Date(Date.now()-1).toISOString());await expect(requireUser()).rejects.toThrow('Sign in');mocks.get.mockReturnValue({value:'fake'});await expect(requireUser()).rejects.toThrow('Sign in');expect(mocks.emailUser).not.toHaveBeenCalled()});
it('preserves existing email sign-in when there is no Telegram cookie',async()=>{mocks.get.mockReturnValue(undefined);expect((await requireUser()).user.id).toBe('email-owner');expect(mocks.emailUser).toHaveBeenCalledOnce()});
it('revokes the exact hashed session and clears its cookie on logout',async()=>{const eq=vi.fn(async()=>({error:null}));mocks.from.mockReturnValue({delete:()=>({eq})});await clearTelegramSession();expect(eq).toHaveBeenCalledWith('token_hash',hashSession(token));expect(mocks.delete).toHaveBeenCalledWith('nafs-telegram-session')});
it('rejects writes from a stale tab after a different account takes over the session',async()=>{const {guard}=await import('../lib/server');vi.stubEnv('APP_URL','https://nafs.example');for(const kind of ['data','account','support'])await expect(guard(new Request('https://nafs.example/api/'+kind,{method:'POST',headers:{origin:'https://nafs.example','x-nafs-workspace':'previous-owner'}}),owner,kind)).rejects.toThrow('Your account changed')});
