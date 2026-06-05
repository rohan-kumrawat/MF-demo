import { BackupController } from './backup.controller';

describe('BackupController', () => {
  it('calls BackupService.runBackup and returns id/status', async () => {
    const mockService = { runBackup: jest.fn().mockResolvedValue({ id: 'abc', status: 'SUCCESS' }) } as any;
    const ctrl = new BackupController(mockService);
    const res = await ctrl.run();
    expect(mockService.runBackup).toHaveBeenCalled();
    expect(res).toEqual({ id: 'abc', status: 'SUCCESS' });
  });
});
