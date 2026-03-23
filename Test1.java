public class Test1 extends Thread
{
    public static void m1()
    {
        for(int i=1;i<=5;i++)
        {
            System.out.println(currentThread().getName());
        }
    }
    public void run()
    {
        Test1.m1();
    }
    public static void main(String[] args)
    {
        Test1 t1=new Test1();
        Test1 t2=new Test1();
        t1.start();
        t2.start();
    }
    
}
