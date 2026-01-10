class sendEmail {
    public constructor(){
        console.log('the sendemail constructor has been called ')
    }
    
}

class User {
    private readonly email = new sendEmail();
    
}

class Order {
    private email;
    constructor(e:sendEmail) {
        this.email = e;
    }
}

class Pay {
   private email;
    constructor(e:sendEmail) {
        this.email = e;
    }
}

class Reviews {
   private email;
    constructor(e:sendEmail) {
        this.email = e;
    }
}

// Dipendancy Injection container
const SendEmail = new sendEmail();
// Tight coupling
const user:User = new User();
// Loose Coupling
let order:Order = new Order(SendEmail);
let pay:Pay = new Pay(SendEmail);
let review = new Reviews(SendEmail);


// الترابط الضعيف (Loose Coupling)

// استخدام كائن واحد (Singleton)
// الذاكرة 