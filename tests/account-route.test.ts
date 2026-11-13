import {it,expect,vi,beforeEach} from 'vitest';
import {createHash} from 'node:crypto';
const mock=vi.hoisted(()=>({user:vi.fn(),guard:vi.fn(),from:vi.fn(),deleteUser:vi.fn(),snapshot:vi.fn(),clear:vi.fn(),signOut:vi.fn(),eq:vi.fn(),like:vi.fn()}));
vi.mock('@/lib/server',()=>({requireUser:mock.user,guard:mock.guard,admin:()=>({from:mock.from,auth:{admin:{deleteUser:mock.deleteUser}}}),snapshot:mock.snapshot,clearTelegramSession:mock.clear,fail:(e:Error&{status?:number})=>new Response(JSON.stringify({error:e.message}),{status:e.status||400})}));
import {POST} from '../app/api/account/route';
const id='11111111-1111-4111-8111-111111111111';
const request=(body:unknown)=>new Request('https://nafs.example/api/account',{method:'POST',headers:{origin:'https://nafs.example','x-nafs-workspace':id},body:JSON.stringify(body)});
beforeEach(()=>{
 vi.clearAllMocks();mock.user.mockResolvedValue({user:{id},db:{auth:{signOut:mock.signOut}}});mock.guard.mockResolvedValue(undefined);mock.deleteUser.mockResolvedValue({error:null});mock.snapshot.mockResolvedValue({state:{tasks:[]}});
 mock.eq.mockImplementation(()=>({maybeSingle:async()=>({data:{telegram_id:12345},error:null}),then:(resolve:(v:unknown)=>unknown)=>Promise.resolve({data:[],error:null}).then(resolve)}));
 mock.like.mockResolvedValue({error:null});mock.from.mockReturnValue({select:()=>({eq:mock.eq}),delete:()=>({eq:mock.eq,like:mock.like})});
});
it('deletes only the authenticated account, invalidates its session and removes current and legacy login-rate keys',async()=>{
 const response=await POST(request({action:'delete'}));expect(response.status).toBe(200);
 expect(mock.deleteUser).toHaveBeenCalledExactlyOnceWith(id);expect(mock.like).toHaveBeenCalledWith('key',id+':%');
 expect(mock.eq).toHaveBeenCalledWith('key','telegram-identity:'+createHash('sha256').update('12345').digest('hex')+':login');
 expect(mock.clear).toHaveBeenCalledOnce();expect(mock.signOut).toHaveBeenCalledOnce();
});
it('rejects a forged account selector before any database or deletion request',async()=>{
 expect((await POST(request({action:'delete',user_id:'someone-else'}))).status).toBe(400);
 expect(mock.deleteUser).not.toHaveBeenCalled();expect(mock.from).not.toHaveBeenCalled();
});
it('exports only records filtered to the server-verified user',async()=>{
 expect((await POST(request({action:'export'}))).status).toBe(200);expect(mock.snapshot).toHaveBeenCalledExactlyOnceWith(id);
 for(const args of mock.eq.mock.calls)expect(args).toEqual(['user_id',id]);
 expect(mock.deleteUser).not.toHaveBeenCalled();expect(mock.from).not.toHaveBeenCalledWith('telegram_sessions');expect(mock.from).not.toHaveBeenCalledWith('telegram_auth_replays');
});
