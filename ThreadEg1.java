public class ThreadEg1 extends Thread
{
    public void run()
    {
        synchronized(this)
        {
        int sum=0;
        for(int i=1;i<=5;i++)
        {
            sum+=i;
        }
        System.out.println(sum);
        notify();
       }
    }
    public static void main(String[] args) throws Exception
    {
        ThreadEg1 t1=new ThreadEg1();
        ThreadEg1 t2=new ThreadEg1();
        ThreadEg1 t3=new ThreadEg1();
        t1.start();
        synchronized(t1)
        {
            t1.wait();
        }
        t2.start();
        t3.start();
        
    }
}
