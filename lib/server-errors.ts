import 'server-only';
import {randomUUID} from 'node:crypto';

export class ApiError extends Error {
  readonly diagnosticId = randomUUID();
  constructor(readonly code:string, message:string, readonly status:number, readonly retryAfter?:number){super(message)}
}

/** Allowlisted metadata only. Never serialize SDK exceptions, requests or user records. */
export function diagnostic(error:ApiError,operation:string,databaseCode?:string){
  console.warn(JSON.stringify({event:'nafs_server_error',id:error.diagnosticId,code:error.code,status:error.status,
    operation:operation.replace(/[^a-z_]/g,'').slice(0,60),
    ...(databaseCode&&/^[A-Z0-9]{3,12}$/.test(databaseCode)?{databaseCode}:{})}));
  return error;
}

export function databaseFailure(error:unknown,operation:string):ApiError {
  const e=error as {code?:string;status?:number;message?:string}|null;
  const code=typeof e?.code==='string'?e.code:'';
  if(['PGRST202','PGRST205','42P01','42883','42703'].includes(code))return diagnostic(new ApiError('DATABASE_MIGRATION_REQUIRED','Database setup is incomplete. Contact support with the diagnostic ID.',503),operation,code);
  if(['42501','PGRST301','PGRST302','PGRST303'].includes(code)||e?.status===401||e?.status===403)return diagnostic(new ApiError('DATABASE_ACCESS_DENIED','Database access is misconfigured. Contact support with the diagnostic ID.',503),operation,code);
  if(error instanceof TypeError||!code&&/fetch|network|timeout|connect/i.test(e?.message||''))return diagnostic(new ApiError('DATABASE_UNREACHABLE','Could not connect to the database. Try again shortly.',503,10),operation);
  return diagnostic(new ApiError('DATABASE_RPC_FAILED','Database operation failed. Contact support with the diagnostic ID.',503),operation,code);
}

export function backendConfig(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),publishable=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),secret=process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if(!url||!publishable||!secret)throw diagnostic(new ApiError('BACKEND_NOT_CONFIGURED','Accounts are not configured. Guest mode is available.',503),'configuration');
  let parsed:URL;try{parsed=new URL(url)}catch{throw diagnostic(new ApiError('BACKEND_CONFIG_INVALID','Database configuration is invalid.',503),'configuration')}
  if(!['https:','http:'].includes(parsed.protocol)||parsed.username||parsed.password||parsed.pathname!=='/'||parsed.search||parsed.hash||secret.startsWith('sb_publishable_')||publishable.startsWith('sb_secret_'))throw diagnostic(new ApiError('BACKEND_CONFIG_INVALID','Database configuration is invalid.',503),'configuration');
  // Both legacy JWT keys and current opaque sb_publishable_/sb_secret_ keys are accepted.
  return {url:parsed.origin,publishable,secret};
}

export function applicationOrigin(){
  try{const url=new URL(process.env.APP_URL?.trim()||'');if(url.username||url.password||url.search||url.hash||url.pathname!=='/'||!(url.protocol==='https:'||url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))throw Error();return url.origin}
  catch{throw diagnostic(new ApiError('APP_URL_INVALID','Application URL is not configured correctly.',503),'configuration')}
}
