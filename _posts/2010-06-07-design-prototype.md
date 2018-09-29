### 原型模式概念

​	原型模式就是用原型实例指定创建对象的种类，并且通过复制这些原型创建新的对象。在原型模式中，所发动创建的对象通过请求原型对象来拷贝原型对象自己来实现创建过程，当然所发动创建的对象需要知道原型对象的类型。这里也就是说所发动创建的对象只需要知道原型对象的类型就可以获得更多的原型实例对象，至于这些原型对象时如何创建的根本不需要关心。

### 原型模式实现

在Java中原型模式的实现主要是通过clone来实现，在Java中clone又分为浅克隆和深克隆。

- 浅克隆：当原型对象被复制时，只复制它本身和其中包含的值类型的成员变量，而引用类型的成员变量并没有复制。

- 深克隆：除了对象本身被复制外，对象所包含的所有成员变量也将被复制。

  ​

  具体代码说明：为了能使用Java的clone方法，需要实现Cloneable接口。

```java
/**
 * 原型对象
 */
public class Prototype implements Cloneable, Serializable {

	private static final long serialVersionUID = 1L;
	private String string;

	private SerializableObject obj;

	/* 浅复制 */
	public Object clone() throws CloneNotSupportedException {
		Prototype proto = (Prototype) super.clone();
		return proto;
	}

	/* 深复制 */
	public Object deepClone() throws IOException, ClassNotFoundException {

		/* 写入当前对象的二进制流 */
		ByteArrayOutputStream bos = new ByteArrayOutputStream();
		ObjectOutputStream oos = new ObjectOutputStream(bos);
		oos.writeObject(this);

		/* 读出二进制流产生的新对象 */
		ByteArrayInputStream bis = new ByteArrayInputStream(bos.toByteArray());
		ObjectInputStream ois = new ObjectInputStream(bis);
		return ois.readObject();
	}

	public String getString() {
		return string;
	}

	public void setString(String string) {
		this.string = string;
	}

	public SerializableObject getObj() {
		return obj;
	}

	public void setObj(SerializableObject obj) {
		this.obj = obj;
	}

}

//原型对象的属性对象
class SerializableObject implements Serializable {
	private static final long serialVersionUID = 1L;
}

```

客户端调运克隆：

```java
public class Main {
	public static void main(String[] args)
			throws CloneNotSupportedException, IOException, ClassNotFoundException {
		Prototype prototype = new Prototype();
		prototype.setString("oldStr");
		prototype.setObj(new SerializableObject());

		Prototype p1 = (Prototype) prototype.clone();//浅clone
		Prototype p2 = (Prototype) prototype.deepClone();//深clone

		System.out.println(prototype == p1); //false
		System.out.println(prototype.getString() == p1.getString());//true
		System.out.println(prototype.getObj() == p1.getObj());//true
		System.out.println(prototype == p2);//false
		System.out.println(prototype.getString() == p2.getString());//false
		System.out.println(prototype.getObj() == p2.getObj());//false
	}
}
```



### 原型模式总结

**优点**：

- 当创建对象的实例较为复杂的时候，使用原型模式可以简化对象的创建过程，通过复制一个已有的实例可以提高实例的创建效率。


- 扩展性好，由于原型模式提供了抽象原型类，在客户端针对抽象原型类进行编程，而将具体原型类写到配置文件中，增减或减少产品对原有系统都没有影响。


- 原型模式提供了简化的创建结构，工厂方法模式常常需要有一个与产品类等级结构相同的工厂等级结构，而原型模式不需要这样，原型模式中产品的复制是通过封装在类中的克隆方法实现的，无需专门的工厂类来创建产品。


- 可以使用深克隆方式保存对象的状态，使用原型模式将对象复制一份并将其状态保存起来，以便在需要的时候使用(例如恢复到历史某一状态)，可辅助实现撤销操作。

**缺点**：

- 需要为每一个类配置一个克隆方法，而且该克隆方法位于类的内部，当对已有类进行改造的时候，需要修改代码，违反了开闭原则。


- 在实现深克隆时需要编写较为复杂的代码，而且当对象之间存在多重签到引用时，为了实现深克隆，每一层对象对应的类都必须支持深克隆，实现起来会比较麻烦。

**适用环境**：

- 创建新对象成本较大（例如初始化时间长，占用CPU多或占太多网络资源），新对象可以通过复制已有对象来获得，如果相似对象，则可以对其成员变量稍作修改。


- 系统要保存对象的状态，而对象的状态很小。相当于在某个点做个备份。


- 需要避免使用分层次的工厂类来创建分层次的对象，并且类的实例对象只有一个或很少的组合状态，通过复制原型对象得到新实例可以比使用构造函数创建一个新实例更加方便。