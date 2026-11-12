# Private phone preview — requested by owner on 2026-11-06

The user requested a directly viewable phone preview after localhost failed on iPhone. This authorizes updating the existing owner-only static preview; it does not authorize a public launch or bot/backend setup.

Site: appgprj_6aecd51951f8819191722171409f51ca
Existing URL: https://nafs-private-check-werllap.placidmarshmallow1.chatgpt.site
Audience verified: owner, custom, exactly one allowed viewer, no groups or external visitors.
Source commit: c31e12abcaa71f7e8447e6e24c0d72d55766aafa
Saved version 4: appgprj_6aecd51951f8819191722171409f51ca~appgver_0babd4d478188191adba3b984ff16e76
Archive: /workspace/nafs-private-preview-v4-deploy.tar.gz

Source was pushed and artifact saved successfully. Initial deployment appgdep_6aed9c77b81481918cdfb1d0be613939 and retry appgdep_6aed9c9488788191a2d9b73973372519 failed with `no healthy upstream`. No worker error events were returned. Reuse this saved version for a deployment retry; do not save/upload another copy or change the audience. Do not claim the existing URL serves revision 4 until deployment succeeds.

Final retry: appgdep_6aed9cd9cfc081919fa402e66342ded9, failed at 2026-11-06T09:24:51.108680+00:00 with the same `no healthy upstream` infrastructure response. Revision 4 publication remains blocked; no successful new URL was returned.

## Subsequent successful retry

The same revision 4 succeeded on 2026-11-06 at 09:39:01.257831 UTC. Deployment: `appgdep_6aeda02790dc8191b49006e47b314a1f`. The existing owner-only URL now serves revision 4. The failure note above is historical, not the current deployment state.

The current motivation changes are tracked separately in `MOTIVATION-RELEASE.md`; do not imply they are in revision 4.

## Motivation preview published on owner request

On 2026-11-06 the owner asked «Дай мне проверить», authorizing an update to the existing owner-only phone preview. The audience was verified as one owner, no groups and no external visitors; it was not changed.

- URL: https://nafs-private-check-werllap.placidmarshmallow1.chatgpt.site
- Source commit: `fe7ca5841f921ea08f506901527343ddb573cda4`
- Saved version ID: `appgprj_6aecd51951f8819191722171409f51ca~appgver_fbbfa9187ee481918ae25e005600918a`
- Deployment: `appgdep_6aedcdaf223081919a768bba53e91b81`
- Status: **succeeded**, 2026-11-06T12:53:15.535384+00:00.
- Archive: `/workspace/nafs-private-preview-v5-deploy.tar.gz`.

This is the updated static guest application, with motivation and favorites. The same origin and storage key preserve existing guest records. No backend credentials, Telegram bot configuration, external database, or user data were deployed. Account sync remains unavailable in this preview.
