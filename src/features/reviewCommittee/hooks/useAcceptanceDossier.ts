import { useQuery } from '@tanstack/react-query';
import { acceptanceDossierService } from '../services/acceptance-dossier.service';
export const useAcceptanceDossier = (councilId?: string, proposalId?: string) => useQuery({ queryKey: ['acceptance-dossier', councilId, proposalId], queryFn: () => acceptanceDossierService.get(councilId!, proposalId!), enabled: !!councilId && !!proposalId });
