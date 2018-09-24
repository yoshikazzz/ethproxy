import kue from 'kue';
import * as shell from 'shelljs';

const queue = kue.createQueue();

const sendEmail = (data: any, done: any) => {
  console.log(data);
  done();
};

queue.process('email', function (job, done) {
  sendEmail(job.data, done);
});

queue.process('convertme', function (job, done) {
  const { file, basedUploadUrl, userFolder } = job.data;
  const filename = file.filename.split('.')[0];

  shell.cd(basedUploadUrl);
  const proc = shell.exec(`./convertme.sh yonekura ${userFolder} ${filename} 1`, { async: true }, (code: number, stdout: string, stderr: string) => {
    console.log(stdout);
  });

  proc.stdout.on('end', done);
  proc.stdout.on('error', done);
  proc.stdout.on('close', done);
  // done();
});

kue.app.listen(5555);

export default queue;