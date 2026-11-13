import {it,expect,vi,beforeEach} from 'vitest';
const mocked=vi.hoisted(()=>({requireUser:vi.fn(),admin:vi.fn(),eq:vi.fn()}));
vi.mock('@/lib/server',()=>({requireUser:mocked.requireUser,admin:mocked.admin}));
import {requireOwner,isTelegramOwner} from '../lib/owner-admin';
beforeEach(()=>{vi.clearAllMocks();mocked.admin.mockReturnValue({from:()=>({select:()=>({eq:mocked.eq})})});mocked.eq.mockReturnValue({maybeSingle:async()=>({data:{telegram_id:6123609704},error:null})})});
it('never promotes a guest or email account based on claimed owner identity',async()=>{
 mocked.requireUser.mockRejectedValue(Error('Sign in'));await expect(requireOwner()).rejects.toThrow('Sign in');
 expect(await isTelegramOwner('6123609704','email')).toBe(false);expect(mocked.admin).not.toHaveBeenCalled();
});
it('queries the verified session owner and requires its stored Telegram mapping',async()=>{
 mocked.requireUser.mockResolvedValue({user:{id:'verified-owner'},provider:'telegram'});
 expect(await requireOwner()).toMatchObject({user:{id:'verified-owner'}});expect(mocked.eq).toHaveBeenCalledWith('user_id','verified-owner');
 mocked.eq.mockReturnValue({maybeSingle:async()=>({data:{telegram_id:12345},error:null})});
 await expect(requireOwner()).rejects.toMatchObject({code:'OWNER_REQUIRED',status:403});
});
it('fails closed with a distinct diagnostic code when owner mapping cannot be read',async()=>{
 mocked.eq.mockReturnValue({maybeSingle:async()=>({data:null,error:{code:'42501'}})});
 await expect(isTelegramOwner('verified-owner','telegram')).rejects.toMatchObject({code:'DATABASE_ACCESS_DENIED',status:503});
});
